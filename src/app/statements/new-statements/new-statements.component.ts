import { Component, NgModule, OnInit } from '@angular/core';

import { catchError, map, take, tap } from 'rxjs/operators';
import { TemplateLookup } from '../../types/lob';

import * as firebase from 'firebase';
import { USER_FIELDS } from '../../shared/upload-csv/upload-csv.component';
import { of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectUser } from '../../shared/selectors/user.selectors';
import { AppState } from '../../app-state';
import { ValidationService } from '../../shared/services/validation.service';
import { LobService } from '../../shared/services/lob.service';
import { OrganizationService } from '../../shared/services/organization.service';
import { StatementService } from '../../shared/services/statement.service';
import { User } from '../../shared/reducers/user.reducers';

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
  data;
  selectedStatement = undefined;
  fieldNames = USER_FIELDS;
  env = 'test';

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
      console.log('here', this.data);
      const data = [...this.data];
      // TODO: should use firebase record
      const headerRow = USER_FIELDS;

      this.headingList = [...headerRow, 'Test', 'Preview'];
      this.fieldNames = headerRow;
      this.dataList = data;
    });
  }

  uploadData(data) {
    this.errorMessage = undefined;
    this.data = data;
    this.checkData();
  }

  checkData() {
    if (this.selectedStatement && this.data) {
      this.validator.checkData([...this.data], this.selectedStatement);
      return;
    }
    this.errorMessage = 'selectStatement';
    this.dataList = undefined;
  }

  sendAll() {
    // this.objList.forEach(async (row) => {
    //   await this.lobService
    //     .sendLetter(TemplateLookup.ChcSekVersion1, row)
    //     .toPromise();
    // });
  }

  async statementHistory(res, id) {
    console.error(res);
    const statementHistoryObj = await this.makeStatementHistoryObj(res, id);
    this.statementService.postStatementHistory(statementHistoryObj);
  }

  testOne(row) {
    this.lobService
      .sendLetter(TemplateLookup.ChcSekVersion1, row)
      .pipe(take(1))
      .subscribe(
        (res: any) => {
          this.statementHistory(res, row.id);
          const tableRow = this.dataList.find((item) => item.id === row.id);
          tableRow.url = res.url;
        },
        (res) => {
          this.statementHistory(res, row.id);
        }
      );
  }

  statementSelect(option) {
    this.errorMessage = undefined;
    this.checkData();
  }

  async availableStatements() {
    await this.loadStatements$.toPromise();
  }

  openUrl(url) {
    window.open(url, '_blank');
  }

  async makeStatementHistoryObj(res, id) {
    const user: User = await this.user$.pipe(take(1)).toPromise();
    const obj = {
      created: firebase.firestore.FieldValue.serverTimestamp(),
      group: '',
      id,
      ltrId: '',
      status: undefined,
      environment: this.env,
      user: user.id,
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
    this.env = env;
  }
}