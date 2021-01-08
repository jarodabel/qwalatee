import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { catchError, map, take, tap } from 'rxjs/operators';
import { LobService } from '../services/lob.service';
import { OrganizationService } from '../services/organization.service';
import { UserService } from '../services/user.service';
import { ValidationService } from '../services/validation.service';
import { SharedModule } from '../shared/shared.module';
import { TemplateLookup } from '../types/lob';

import * as firebase from 'firebase';
import { StatementService } from '../services/statement.service';
import { USER_FIELDS } from '../shared/upload-csv/upload-csv.component';
import { of } from 'rxjs';

@Component({
  selector: 'statements',
  templateUrl: './statements.component.html',
  styleUrls: ['statements.component.scss'],
})
export class StatementsComponent implements OnInit {
  objList = [];
  errorMessage: string;
  headingList: string[];
  dataList: any[];
  statements$;
  data;
  selectedStatement = undefined;
  fieldNames = USER_FIELDS

  constructor(
    private userService: UserService,
    private validator: ValidationService,
    private lobService: LobService,
    private orgService: OrganizationService,
    private statementService: StatementService,
  ) {}

  user$ = this.userService.dbUser$;

  ngOnInit() {
    this.availableStatements();
    this.validator.responseSub.subscribe((isValid) => {
      if (!isValid) {
        this.headingList = undefined;
        this.dataList = undefined;
        this.errorMessage = 'badData';
        return;
      }
      const data = [...this.data];
      // TODO: should use firebase record
      const headerRow = USER_FIELDS;

      this.headingList = [...headerRow, 'Test', 'Preview'];
      this.fieldNames = headerRow;
      this.dataList = data;
      console.log(data);
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
  }

  sendAll() {
    // this.objList.forEach(async (row) => {
    //   await this.lobService
    //     .sendLetter(TemplateLookup.ChcSekVersion1, row)
    //     .toPromise();
    // });
  }

  statementHistory(res, id) {
    const statementHistoryObj = this.makeStatementHistoryObj(res, id);
    this.statementService.postStatementHistory(statementHistoryObj, 1);
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

  statementSelect() {
    this.errorMessage = undefined;
    this.checkData();
  }

  availableStatements() {
    this.statements$ = this.orgService.getUsersOrganization().pipe(
      map((org) => {
        const orgData = org.data();
        return orgData.availableStatements.map(async (ref) => {
          console.log(ref)
          const statement = await ref.get();
          const data = statement.data();
          const response = { id: statement.id, name: data.name };
          return response;
        });
      }),
      take(1),
      catchError((err)=>{
        console.log(err);
        return of(null);
      }),
    );
  }

  openUrl(url) {
    window.open(url, '_blank');
  }

  private makeStatementHistoryObj(res, id) {
    const obj = {
      created: firebase.firestore.FieldValue.serverTimestamp(),
      group: '',
      id,
      ltrId: '',
      status: undefined,
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

@NgModule({
  declarations: [StatementsComponent],
  exports: [],
  imports: [CommonModule, SharedModule, BrowserModule, FormsModule],
})
export class StatementsModule {}
