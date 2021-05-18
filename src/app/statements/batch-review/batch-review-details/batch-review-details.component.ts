import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { from, merge, of, Subject, timer } from 'rxjs';
import {
  ignoreElements,
  mergeMap,
  switchMap,
  take,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { AppState } from '../../../app-state';
import { User } from '../../../shared/reducers/user.reducers';
import { selectUser } from '../../../shared/selectors/user.selectors';
import {
  BatchManagementService,
  Env,
} from '../../../shared/services/batch-management.service';
import { LobService } from '../../../shared/services/lob.service';
import { StatementService } from '../../../shared/services/statement.service';
import {
  UploadObject,
  USER_FIELDS,
} from '../../../shared/services/upload.service';
import { UserService } from '../../../shared/services/user.service';
import { AccessType } from '../../../types/access';
import { TemplateLookup } from '../../../types/lob';
import { ModalType } from '../batch-review.component';
import firebase from 'firebase/app';
import { ActivatedRoute } from '@angular/router';
import { selectUploadObjectById } from '../../../shared/selectors/statements.selectors';

// const reviewList = [[], {}, {}, {}];

@Component({
  selector: 'app-batch-review-details',
  templateUrl: './batch-review-details.component.html',
  styleUrls: ['./batch-review-details.component.scss'],
})
export class BatchReviewDetailsComponent implements OnInit, OnDestroy {
  modalTypes = ModalType;
  pending = false;
  headings = ['', '', ...USER_FIELDS].splice(0, 8);
  fieldNames = [...USER_FIELDS].splice(0, 6);
  selectedCount = 0;
  records = [];
  completedRequests = 0;
  failedRequests = 0;
  uploadId: string;
  missingUploadId = false;
  env = Env.Test;
  filename: string;
  uploadObj: UploadObject;
  reviewList: any[] = [];
  reviewInProgress = false;
  currentLtrId: string;

  user$ = this.store.pipe(select(selectUser));
  destroy$ = new Subject();

  routeParams$ = this.route.params;
  uploadObject$ = this.routeParams$.pipe(
    switchMap(({ uploadId }) =>
      this.store.select(selectUploadObjectById(uploadId))
    )
  );

  constructor(
    private batchManagementService: BatchManagementService,
    private lobService: LobService,
    private statementService: StatementService,
    private userService: UserService,
    private store: Store<AppState>,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.batchManagementService
      .getPendingBatches()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.routeParams$.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.uploadId = params.uploadId;
      this.filename = '';
      if (this.uploadId) {
        this.populateRecords();
      } else {
        this.missingUploadId = true;
      }
    });
    this.uploadObject$.pipe(takeUntil(this.destroy$)).subscribe((obj) => {
      this.uploadObj = obj;
      this.reviewListFn();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  populateRecords() {
    this.selectedCount = 0;
    this.batchManagementService
      .getRecordsByUploadId(this.uploadId)
      .then((snapshot) => {
        const res = [];
        snapshot.forEach((doc) => {
          res.push({ recordId: doc.id, ...doc.data(), selected: false });
        });
        this.records = res;
      })
      .catch(() => {
        this.records = [];
      });
  }

  rowSelected(row) {
    row.selected = true;
    this.count();
  }

  selectAll() {
    this.records.forEach((row) => (row.selected = true && !row.ltrId));
    this.count();
  }

  unselectAll() {
    this.records.forEach((row) => (row.selected = false));
    this.count();
  }

  count() {
    this.selectedCount = this.records.filter((row) => row.selected).length || 0;
  }

  openUrl(id) {
    const accessType =
      this.env === Env.Live
        ? AccessType.STATEMENTS_VIEW_STATEMENT_LIVE
        : AccessType.STATEMENTS_VIEW_STATEMENT_TEST;
    this.userService.postAccessLog(accessType, id);
    this.lobService
      // TODO: need to update function to accept Test or Live, not test or live
      .getLetterObject('test', id)
      .pipe(take(1))
      .toPromise()
      .then((res: any) => {
        window.open(res.url, '_blank');
      });
  }

  createStatements(partialRecords) {
    const promise = (row, i) =>
      new Promise(
        (async (resolve, reject) => {
          let res;
          try {
            res = await this.lobService
              .sendLetter(this.env, TemplateLookup[this.env], row)
              .pipe(take(1))
              .toPromise();

            await this.updateRecord(row, res);
          } catch (err) {
            res = err;
            this.failedRequests = this.failedRequests + 1;
          }

          await this.statementHistory(res, row.id, row.date, row.uploadId);
          this.completedRequests = this.completedRequests + 1;
          if (this.completedRequests === records.length) {
            this.pending = false;
            this.count();
          }

          resolve();
        }).bind(this)
      );

    const records = [...partialRecords].map((record) => ({
      ...record,
      charges: Object.keys(record.charges).map((key) => record.charges[key]),
    }));

    from(records)
      .pipe(
        mergeMap(
          (row, i) => merge(promise(row, i), timer(0).pipe(ignoreElements())),
          undefined,
          3
        )
      )
      .subscribe(
        (s) => {
          console.log('success', this.completedRequests - this.failedRequests);
          console.log('error', this.failedRequests);
        },
        (err) => {
          console.log('error', err);
        }
      );
  }

  startStatements() {
    this.pending = true;
    this.completedRequests = 0;
    this.failedRequests = 0;

    const selectedRecords = [...this.records].filter((row) => row.selected);
    this.createStatements(selectedRecords);
  }

  async statementHistory(res, id, date, uploadId) {
    const statementHistoryObj = await this.makeStatementHistoryObj(
      res,
      id,
      date,
      uploadId
    );
    await this.statementService.postStatementHistory(statementHistoryObj);
    const accessType =
      this.env === Env.Live
        ? AccessType.STATEMENTS_CREATE_STATEMENT_LIVE
        : AccessType.STATEMENTS_CREATE_STATEMENT_TEST;
    await this.userService.postAccessLog(accessType, id);
  }

  async makeStatementHistoryObj(res, id, date, uploadId) {
    const user: User = await this.user$.pipe(take(1)).toPromise();
    const obj = {
      created: firebase.firestore.FieldValue.serverTimestamp(),
      id,
      ltrId: '',
      status: undefined,
      environment: this.env,
      user: user.id,
      date,
      uploadId,
    };
    if (res.error) {
      obj.status = 'error';
      return obj;
    }
    obj.status = 'success';
    obj.ltrId = res.id;
    return obj;
  }

  updateRecord(record, res) {
    return new Promise((resolve, reject) => {
      const row = this.records.find((rec) => rec.recordId === record.recordId);
      row.url = res.url;
      row.ltrId = res.id;
      row.selected = false;
      this.batchManagementService
        .setRecordAsTestView(record.recordId, res.id)
        .then(() => {
          resolve('');
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }

  getRecordForReview(reviewIndex) {
    let recordId;
    if (reviewIndex === 0) {
      recordId = this.uploadObj.reviewStatements.one.recordId;
    } else if (reviewIndex === 1) {
      recordId = this.uploadObj.reviewStatements.two.recordId;
    } else if (reviewIndex === 2) {
      recordId = this.uploadObj.reviewStatements.three.recordId;
    }

    return this.records.find((record) => record.recordId === recordId);
  }

  reviewListFn() {
    const isChecked = (index) => {
      if (index === 0) {
        return (
          this.uploadObj?.reviewStatements &&
          this.uploadObj.reviewStatements.one?.approved
        );
      } else if (index === 1) {
        return (
          this.uploadObj?.reviewStatements &&
          this.uploadObj.reviewStatements.two?.approved
        );
      } else if (index === 2) {
        return (
          this.uploadObj?.reviewStatements &&
          this.uploadObj.reviewStatements.three?.approved
        );
      } else if (index === 3) {
        return this.uploadObj?.reviewIsComplete;
      } else if (index === 4) {
        return this.uploadObj?.mailHasStarted;
      } else if (index === 5) {
        return this.uploadObj?.mailComplete;
      }
      return false;
    };
    const isDisabled = (index) => {
      if (isChecked(index)) {
        return true;
      }
      return !isChecked(index - 1);
    };
    const list = [
      [
        {
          disabled: false,
          checked: isChecked(0),
          title: 'Review 1',
        },
        {
          disabled: isDisabled(1),
          checked: isChecked(1),
          title: 'Review 2',
        },
        {
          disabled: isDisabled(2),
          checked: isChecked(2),
          title: 'Review 3',
        },
      ],
      {
        disabled: isDisabled(3),
        checked: isChecked(3),
        title: 'Mailing Approved',
      },
      {
        disabled: isDisabled(4),
        checked: isChecked(4),
        title: 'Mailing In Progress',
      },
      {
        disabled: isDisabled(5),
        checked: isChecked(5),
        title: 'Mailing Complete',
      },
    ];
    this.reviewList = list;
    console.log(list);
  }

  async reviewStepClicked(index) {
    const record = this.getRecordForReview(index);
    let res;
    let ltrId;
    if (!record.ltrId) {
      res = await this.lobService
        .sendLetter(this.env, TemplateLookup[this.env], record)
        .pipe(take(1)).toPromise();
      ltrId = res.ltrId;
    } else {
      ltrId = record.ltrId;
    }

    if(!ltrId){
      throw new Error("there was an error find ltrId");
      return;
    }

    this.reviewInProgress = true;
    this.currentLtrId = ltrId
    console.log('here', ltrId);
  }
}
