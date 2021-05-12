import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { from, merge, of, timer } from 'rxjs';
import { ignoreElements, mergeMap, take } from 'rxjs/operators';
import { AppState } from '../../../app-state';
import { User } from '../../../shared/reducers/user.reducers';
import { selectUser } from '../../../shared/selectors/user.selectors';
import {
  BatchManagementService,
  Env,
} from '../../../shared/services/batch-management.service';
import { LobService } from '../../../shared/services/lob.service';
import { StatementService } from '../../../shared/services/statement.service';
import { USER_FIELDS } from '../../../shared/services/upload.service';
import { UserService } from '../../../shared/services/user.service';
import { AccessType } from '../../../types/access';
import { LOB_ENV, TemplateLookup } from '../../../types/lob';
import { ModalType } from '../batch-review.component';
import firebase from 'firebase/app';

@Component({
  selector: 'send-modal',
  templateUrl: './send-modal.component.html',
  styleUrls: ['./send-modal.component.scss'],
})
export class SendModalComponent implements OnInit, OnChanges {
  @Input()
  modalType: ModalType;
  @Input()
  showModal: boolean;
  @Input()
  uploadId: string;
  @Input()
  env: Env = Env.Test;
  @Output() done: EventEmitter<any> = new EventEmitter();

  modalTypes = ModalType;
  pending = false;
  headings = ['Select', '', ...USER_FIELDS].splice(0, 8);
  fieldNames = [...USER_FIELDS].splice(0, 6);
  selectedCount = 0;
  records = [];
  completedRequests = 0;
  failedRequests = 0;

  user$ = this.store.pipe(select(selectUser));

  constructor(
    private batchMangementService: BatchManagementService,
    private lobService: LobService,
    private statementService: StatementService,
    private userService: UserService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    if (this.uploadId) {
      this.populateRecords();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.uploadId?.currentValue) {
      this.populateRecords();
    }
  }

  populateRecords() {
    this.selectedCount = 0;
    this.batchMangementService
      .getRecordsByUploadId(this.uploadId)
      .then((snapshot) => {
        const res = [];
        snapshot.forEach((doc) => {
          res.push({ id: doc.id, ...doc.data(), selected: false });
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
    this.records.forEach((row) => (row.selected = true && !row.url));
    this.count();
  }

  unselectAll() {
    this.records.forEach((row) => (row.selected = false));
    this.count();
  }

  count() {
    this.selectedCount = this.records.filter((row) => row.selected).length || 0;
  }

  openUrl(url, id) {
    const accessType =
      this.env === Env.Live
        ? AccessType.STATEMENTS_VIEW_STATEMENT_LIVE
        : AccessType.STATEMENTS_VIEW_STATEMENT_TEST;
    this.userService.postAccessLog(accessType, id);
    window.open(url, '_blank');
  }

  createStatements() {
    this.pending = true;
    this.completedRequests = 0;
    this.failedRequests = 0;

    const records = [...this.records].filter((row) => row.selected);

    const promise = (row, i) =>
      new Promise(
        (async (resolve, reject) => {
          let res;
          try {
            res = await this.lobService
              .sendLetter(this.env, TemplateLookup[this.env], row)
              .pipe(take(1))
              .toPromise();
            row.url = res.url;
            row.selected = false;
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
          console.log(s);
          console.log('all done');
          console.log('success', this.completedRequests - this.failedRequests);
          console.log('error', this.failedRequests);
        },
        (err) => {
          console.log('error', err);
        }
      );
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
}
