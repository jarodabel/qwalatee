import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { from, merge, Subject, timer } from 'rxjs';
import {
  ignoreElements,
  mergeMap,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';
import { AppState } from '../../app-state';
import { User } from '../../shared/reducers/user.reducers';
import { selectUser } from '../../shared/selectors/user.selectors';
import {
  BatchManagementService,
  Env,
} from '../../shared/services/batch-management.service';
import { LobService } from '../../shared/services/lob.service';
import { StatementService } from '../../shared/services/statement.service';
import {
  UploadObject,
  USER_FIELDS,
} from '../../shared/services/upload.service';
import { UserService } from '../../shared/services/user.service';
import { AccessType } from '../../types/access';
import { LOB_ENV, TemplateLookup } from '../../types/lob';
import firebase from 'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';
import { selectUploadObjectById } from '../../shared/selectors/statements.selectors';
import { BatchSharedComponent } from '../batch-shared/batch-shared.component';

export enum ReviewIdentifiers {
  one,
  two,
  three,
}
@Component({
  selector: 'app-batch-explore',
  templateUrl: './batch-explore.component.html',
  styleUrls: ['./batch-explore.component.scss'],
})
export class BatchExploreComponent
  extends BatchSharedComponent
  implements OnInit, OnDestroy {
  headings = ['', '', ...USER_FIELDS].splice(0, 8);
  fieldNames = [...USER_FIELDS].splice(0, 6);

  uploadId: string;
  missingUploadId = false;
  filename: string;
  uploadObj: UploadObject;
  reviewList: any[] = [];
  currentLtrId: string;

  destroy$ = new Subject();

  routeParams$ = this.route.params;
  uploadObject$ = this.routeParams$.pipe(
    switchMap(({ uploadId }) =>
      this.store.select(selectUploadObjectById(uploadId))
    )
  );

  constructor(
    batchManagementService: BatchManagementService,
    statementService: StatementService,
    lobService: LobService,
    userService: UserService,
    store: Store<AppState>,
    route: ActivatedRoute
  ) {
    super(
      batchManagementService,
      lobService,
      statementService,
      userService,
      store,
      route
    );
  }

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
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  populateRecords() {
    this.selectedCount = 0;
    this.batchManagementService
      .getRecordsByUploadId(this.uploadId)
      .then((snapshot) => {
        console.log('snapshot', snapshot);
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

  openUrl(id) {
    const accessType =
      this.env === LOB_ENV.LIVE
        ? AccessType.STATEMENTS_VIEW_STATEMENT_LIVE
        : AccessType.STATEMENTS_VIEW_STATEMENT_TEST;
    this.userService.postAccessLog(accessType, id);
    this.lobService
      .getLetterObject(LOB_ENV.TEST, id)
      .pipe(take(1))
      .toPromise()
      .then((res: any) => {
        window.open(res.url, '_blank');
      });
  }

  send() {
    const selectedRecords = [...this.records].filter((row) => row.selected);
    this.startStatements(selectedRecords);
  }
}
