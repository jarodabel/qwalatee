import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { map, take, tap } from 'rxjs/operators';
import { LobService } from '../services/lob.service';
import { OrganizationService } from '../services/organization.service';
import { UserService } from '../services/user.service';
import { ValidationService } from '../services/validation.service';
import { SharedModule } from '../shared/shared.module';
import { TemplateLookup } from '../types/lob';

type LobLetterObject = {
  url
}

@Component({
  selector: 'statements',
  templateUrl: './statements.component.html',
  styleUrls: ['statements.component.scss'],
})
export class StatementsComponent implements OnInit {
  objList = [];
  errorMessage: string;
  headingList: string[];
  dataList: object[];
  statements$;
  data;
  selectedStatement = 'none';

  constructor(
    private userService: UserService,
    private validator: ValidationService,
    private lobService: LobService,
    private orgService: OrganizationService
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
      const headerRow = [...data[0]];
      data.splice(0, 1);

      const objList = data.map((row) => {
        const user = {};
        headerRow.forEach((key, i) => (user[key] = row[i]));
        return user;
      });

      this.headingList = headerRow;
      this.dataList = objList;
    });
  }

  uploadData(data) {
    this.errorMessage = undefined;
    this.data = data;
    this.checkData();
  }

  checkData() {
    this.validator.checkData([...this.data], this.selectedStatement);
  }

  sendAll() {
    this.objList.forEach(async (row) => {
      await this.lobService
        .sendLetter(TemplateLookup.ChcSekVersion1, row)
        .toPromise();
    });
  }

  async testOne(row) {
    const res = await this.lobService
      .sendLetter(TemplateLookup.ChcSekVersion1, row)
      .toPromise() as any;

    const tableRow = this.data.find((item) => item.id === row.id);
    tableRow.id = res.url;
    // console.log(res);
    console.log(res.url)
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
          const statement = await ref.get();
          const data = statement.data();
          const response = { id: statement.id, name: data.name };
          return response;
        });
      }),
      take(1)
    );
  }
}

@NgModule({
  declarations: [StatementsComponent],
  exports: [],
  imports: [CommonModule, SharedModule, BrowserModule, FormsModule],
})
export class StatementsModule {}
