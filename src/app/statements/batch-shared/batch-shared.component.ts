import { Component } from '@angular/core';
import { from, merge, timer } from 'rxjs';
import { ignoreElements, mergeMap, take } from 'rxjs/operators';
import { User } from '../../shared/reducers/user.reducers';
import {
  BatchManagementService,
  Env,
} from '../../shared/services/batch-management.service';
import { LobService } from '../../shared/services/lob.service';
import { AccessType } from '../../types/access';
import { AddressOverwrite, ChcAddress, LOB_ENV, TemplateLookup } from '../../types/lob';
import firebase from 'firebase/app';
import { StatementService } from '../../shared/services/statement.service';
import { UserService } from '../../shared/services/user.service';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../app-state';
import { selectUser } from '../../shared/selectors/user.selectors';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-batch-shared',
  templateUrl: './batch-shared.component.html',
  styleUrls: ['./batch-shared.component.scss'],
})
export class BatchSharedComponent {
  pending = false;

  completedRequests = 0;
  failedRequests = 0;
  selectedCount = 0;

  records = [];

  env = LOB_ENV.TEST;
  user$ = this.store.pipe(select(selectUser));
  routeParams$ = this.route.params;

  constructor(
    protected batchManagementService: BatchManagementService,
    protected lobService: LobService,
    protected statementService: StatementService,
    protected userService: UserService,
    protected store: Store<AppState>,
    protected route: ActivatedRoute
  ) {}

  count() {
    this.selectedCount = this.records.filter((row) => row.selected).length || 0;
  }

  createStatements(partialRecords) {
    const promise = (row, i) =>
      new Promise(
        (async (resolve, reject) => {
          let res;
          try {
            res = await this.lobService
              .sendLetter(this.env, TemplateLookup[this.env], row, AddressOverwrite[this.env])
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

    const records = [...partialRecords].map((record) =>
      this.mapCharges(record)
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
          console.log('success', this.completedRequests - this.failedRequests);
          console.log('error', this.failedRequests);
        },
        (err) => {
          console.log('error', err);
        },
        () => {
          if (this.env === LOB_ENV.LIVE) {
            this.finished();
          }
        }
      );
  }

  mapCharges(record) {
    return {
      ...record,
      charges: Object.keys(record.charges).map((key) => record.charges[key]),
    };
  }

  startStatements(records) {
    this.pending = true;
    this.completedRequests = 0;
    this.failedRequests = 0;

    this.createStatements(records);
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
      this.env === LOB_ENV.LIVE
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

  async finished() {
    console.log('done');
    this.env = LOB_ENV.TEST;
    const update = {
      mailComplete: true,
      mailHasErrors: this.failedRequests > 0,
    };

    const { uploadId } = await this.routeParams$.pipe(take(1)).toPromise();
    this.statementService
      .updateUploadRecord(uploadId, update)
      .then((res) => {})
      .catch((err) => {
        console.error(err);
      });
  }
}
