import { Component, NgModule, OnInit } from '@angular/core';

import {
  catchError,
  concatMap,
  ignoreElements,
  map,
  mergeMap,
  take,
  tap,
} from 'rxjs/operators';
import { LOB_ENV, TemplateLookup } from '../../types/lob';

import firebase from 'firebase/app';
import { from, merge, Observable, of, Subject, timer } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectUser } from '../../shared/selectors/user.selectors';
import { AppState } from '../../app-state';
import { ValidationService } from '../../shared/services/validation.service';
import { LobService } from '../../shared/services/lob.service';
import { OrganizationService } from '../../shared/services/organization.service';
import { StatementService } from '../../shared/services/statement.service';
import { User } from '../../shared/reducers/user.reducers';
import { UserService } from '../../shared/services/user.service';
import { AccessType } from '../../types/access';
import { DocumentReference } from '@angular/fire/firestore';
import { USER_FIELDS } from '../../shared/services/upload.service';

@Component({
  selector: 'new-statements',
  templateUrl: './new-statements.component.html',
  styleUrls: ['new-statements.component.scss'],
})
export class NewStatementsComponent implements OnInit {
  statements;
  objList = [];
  errorMessage: string;
  headingList: string[];
  dataList: any[];
  mostRecentUploadDoc: DocumentReference;
  data;
  selectedStatement = undefined;
  fieldNames = USER_FIELDS;
  env = 'Test';
  completedRequests;
  failedRequests;
  bulkLobRunning = false;
  uploadReset = new Subject();
  estimatedCost = '0';
  filename = '';

  user$ = this.store.pipe(select(selectUser));

  loadStatements$ = this.orgService.getUsersOrganization().pipe(
    map((org) => {
      const orgData = org.data();
      return orgData.availableStatements.map(async (ref) => {
        const statement = await ref.get();
        const data = statement.data();
        return { id: statement.id, name: data.name };
      });
    }),
    tap((statements) => {
      Promise.all(statements).then((stms: any[]) => {
        const numberOfStatements: number = stms.length;
        this.statements = stms;
        if (numberOfStatements > 1) {
          this.selectedStatement = undefined;
        } else if (numberOfStatements === 1) {
          this.selectedStatement = stms[0].id;
        } else {
          this.selectedStatement = undefined;
        }
      });
    }),
    take(1),
    catchError((err) => {
      console.error(err);
      return of(null);
    })
  );

  constructor(
    private validator: ValidationService,
    private lobService: LobService,
    private orgService: OrganizationService,
    private userService: UserService,
    private statementService: StatementService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.availableStatements();
    this.validator.responseSub.subscribe((isValid) => {
      if (!this.data) {
        return;
      }
      if (!isValid) {
        this.headingList = undefined;
        this.dataList = undefined;
        this.errorMessage = 'badData';
        return;
      }
      const data = [...this.data];
      // TODO: should use firebase record
      const headerRow = USER_FIELDS;

      // TODO: Test
      this.headingList = ['Create', 'Preview', ...headerRow];
      this.fieldNames = headerRow;
      this.dataList = data;
      this.updateCosts();
    });
  }

  uploadData({ data, filename }) {
    this.errorMessage = undefined;
    this.data = data;
    this.filename = filename;
    this.checkData(filename);
  }

  async checkData(filename?) {
    if (this.selectedStatement && this.data) {
      this.validator.checkData([...this.data], this.selectedStatement);
      const accessType =
        this.env === LOB_ENV.LIVE
          ? AccessType.STATEMENTS_LOAD_FILE_LIVE
          : AccessType.STATEMENTS_LOAD_FILE_TEST;
      this.mostRecentUploadDoc = await this.userService.postAccessLog(
        accessType,
        '',
        '',
        filename
      );
      return;
    }
    this.errorMessage = 'selectStatement';
    this.dataList = undefined;
  }

  areYouSure() {
    if (!this.dataList) {
      return;
    }
    const answer = confirm(
      `Are you sure? Confirmation will mail ${this.dataList.length} statements. THIS CANNOT BE UNDONE`
    );
    if (answer) {
      this.sendAll();
    }
  }

  async statementHistory(res, id, date) {
    const statementHistoryObj = await this.makeStatementHistoryObj(
      res,
      id,
      date
    );
    await this.statementService.postStatementHistory(statementHistoryObj);
    const accessType =
      this.env === LOB_ENV.LIVE
        ? AccessType.STATEMENTS_CREATE_STATEMENT_LIVE
        : AccessType.STATEMENTS_CREATE_STATEMENT_TEST;
    await this.userService.postAccessLog(accessType, id);
  }

  async createOne(row, index) {
    let res: any;

    try {
      res = await this.createStatementPromise(row);
    } catch {
      this.statementHistory(res, row.id, row.date);
    } finally {
      this.statementHistory(res, row.id, row.date);
      row.url = res.url;
    }
  }

  statementSelect(option) {
    this.errorMessage = undefined;
    this.checkData();
  }

  async availableStatements() {
    await this.loadStatements$.toPromise();
  }

  openUrl(url, id) {
    const accessType =
      this.env === LOB_ENV.LIVE
        ? AccessType.STATEMENTS_VIEW_STATEMENT_LIVE
        : AccessType.STATEMENTS_VIEW_STATEMENT_TEST;
    this.userService.postAccessLog(accessType, id);
    window.open(url, '_blank');
  }

  async makeStatementHistoryObj(res, id, date) {
    const user: User = await this.user$.pipe(take(1)).toPromise();
    const obj = {
      created: firebase.firestore.FieldValue.serverTimestamp(),
      group: '',
      id,
      ltrId: '',
      status: undefined,
      environment: this.env,
      user: user.id,
      date,
      filename: this.filename,
      uploadId: this.mostRecentUploadDoc.id,
    };
    if (res.error) {
      obj.status = 'error';
      return obj;
    }
    obj.status = 'success';
    obj.ltrId = res.id;
    return obj;
  }

  toggleEnv(env) {
    this.reset();
    this.env = env;
  }

  reset() {
    this.dataList = [];
    this.objList = [];
    this.errorMessage = '';
    this.headingList = [];
    this.data = undefined;
    this.env = 'Test';
    this.completedRequests = undefined;
    this.bulkLobRunning = false;
    this.uploadReset.next();
  }

  private updateCosts() {
    this.estimatedCost =
      (Math.round(this.dataList?.length * 0.57 * 100) / 100).toFixed(2) || '0';
  }

  private sendAll() {

  }

  private createStatementPromise(row) {
    return this.lobService
      .sendLetter(this.env, TemplateLookup[this.env], row)
      .pipe(take(1))
      .toPromise();
  }
}
