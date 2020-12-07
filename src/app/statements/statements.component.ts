import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LobService } from '../services/lob.service';
import { UserService } from '../services/user.service';
import { ValidationService } from '../services/validation.service';
import { SharedModule } from '../shared/shared.module';
import { TemplateLookup } from '../types/lob';

@Component({
  selector: 'statements',
  templateUrl: './statements.component.html',
  styleUrls: ['statements.component.scss'],
})
export class StatementsComponent {
  objList = [];
  constructor(
    private userService: UserService,
    private validator: ValidationService,
    private lobService: LobService
  ) {}

  user$ = this.userService.dbUser$;

  uploadData(data) {
    this.validator.responseSub.subscribe((isValid) => {
      const headerRow = [...data[0]];
      data.splice(0, 1);

      const objList = data.map((row) => {
        const user = {};
        headerRow.forEach((key, i) => (user[key] = row[i]));
        return user;
      });
      this.objList = objList;
    });
    this.validator.checkData(data);
  }

  send() {
    this.objList.forEach(async (user) => {
      await this.lobService.sendLetter(TemplateLookup.ChcSekVersion1, user).toPromise();
    });
  }
}

@NgModule({
  declarations: [StatementsComponent],
  exports: [],
  imports: [CommonModule, SharedModule, BrowserModule],
})
export class StatementsModule {}
