import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AppState } from '../../../app-state';
import { selectUser } from '../../../shared/selectors/user.selectors';
import {
  BatchManagementService,
  Env,
} from '../../../shared/services/batch-management.service';
import { LobService } from '../../../shared/services/lob.service';
import {
  UploadObject,
  USER_FIELDS,
} from '../../../shared/services/upload.service';
import { TemplateLookup } from '../../../types/lob';
import { ModalType } from '../batch-review.component';
import { ActivatedRoute, Router } from '@angular/router';
import { selectUploadObjectById } from '../../../shared/selectors/statements.selectors';
import { StatementService } from '../../../shared/services/statement.service';

export enum ReviewIdentifiers {
  one,
  two,
  three,
}

enum StepTitles {
  REVIEW_1 = 'Review 1',
  REVIEW_2 = 'Review 2',
  REVIEW_3 = 'Review 3',
  MAILING_APPROVED = 'Mailing Approved',
  MAILING_IN_PROGRESS = 'Mailing In Progress',
  MAILING_COMPLETE = 'Mailing Complete',
}

@Component({
  selector: 'app-batch-review-details',
  templateUrl: './batch-review-details.component.html',
  styleUrls: ['./batch-review-details.component.scss'],
})
export class BatchReviewDetailsComponent implements OnInit, OnDestroy {
  modalTypes = ModalType;
  pending = false;
  records = [];
  uploadId: string;
  missingUploadId = false;
  env = Env.Test;
  filename: string;
  uploadObj: UploadObject;
  reviewList: any[] = [];
  currentLtrId: string;
  currentStep;
  userId;
  hasPermission = false;

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
    private statementService: StatementService,
    private lobService: LobService,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router
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

    this.user$
      .pipe(
        tap((a) => {
          this.userId = a.id;
          this.hasPermission = a?.lobStatementsLive;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  populateRecords() {
    this.batchManagementService
      .getRecordsByUploadId(this.uploadId)
      .then((snapshot) => {
        const res = [];
        snapshot.forEach((doc) => {
          res.push({ recordId: doc.id, ...doc.data(), selected: false });
        });
        this.records = res.sort((a, b) => {
          if (a.last > b.last) return 1;
          if (b.last > a.last) return -1;
          return 0;
        });
      })
      .catch((err) => {
        console.log('error', err);
        this.records = [];
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
      {
        disabled: false,
        checked: isChecked(0),
        title: StepTitles.REVIEW_1,
      },
      {
        disabled: isDisabled(1),
        checked: isChecked(1),
        title: StepTitles.REVIEW_2,
      },
      {
        disabled: isDisabled(2),
        checked: isChecked(2),
        title: StepTitles.REVIEW_3,
      },
      {
        disabled: isDisabled(3),
        checked: isChecked(3),
        title: StepTitles.MAILING_APPROVED,
      },
      {
        disabled: isDisabled(4),
        checked: isChecked(4),
        title: StepTitles.MAILING_IN_PROGRESS,
      },
      {
        disabled: isDisabled(5),
        checked: isChecked(5),
        title: StepTitles.MAILING_COMPLETE,
      },
    ];
    this.reviewList = [[list[0], list[1], list[2]], list[3], list[4], list[5]];
    this.currentStep = [...list].find((step) => step.checked && !step.disabled);
  }

  mapCharges(record) {
    return {
      ...record,
      charges: Object.keys(record.charges).map((key) => record.charges[key]),
    };
  }

  async reviewStepClicked(index) {
    const record = this.getRecordForReview(index);
    let res;
    let ltrId;

    if (!record.ltrId) {
      res = await this.lobService
        .sendLetter(this.env, TemplateLookup[this.env], this.mapCharges(record))
        .pipe(take(1))
        .toPromise();
      ltrId = res.id;
    } else {
      ltrId = record.ltrId;
    }

    if (!ltrId) {
      throw new Error('there was an error finding ltrId');
      return;
    }

    this.router.navigate([ReviewIdentifiers[index], ltrId], {
      relativeTo: this.route,
    });
  }

  mailStepClicked(index) {}

  async sendAll() {
    this.pending = true;
    console.log('send it');
    const update = {
      'reviewIsComplete': true,
      'reviewApprovedBy': this.userId,
    }

    this.statementService.updateUploadRecord(this.uploadId, update).then((res) => {
      // this.store.dispatch(updateUploadRecordApproved({uploadId, reviewIdentifier, userId: user.id}));
      // this.router.navigate(['../../'], {relativeTo: this.route})
    }).catch((err) => {
      console.error(err)
    });
    // update live statement template
    // update live statement template id
    // convert "mail functions" to shared
    // update firestore object
    // update review list
  }

  areYouSure() {
    if (!this.records) {
      return;
    }
    const answer = confirm(
      `Are you sure? Confirmation will mail ${this.records.length} statements. THIS CANNOT BE UNDONE`
    );
    if (answer) {
      this.sendAll();
    }
  }
}
