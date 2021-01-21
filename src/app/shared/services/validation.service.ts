import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { USER_FIELDS } from '../../shared/upload-csv/upload-csv.component';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  responseSub = new Subject();
  headerFields = [];

  constructor(private db: AngularFirestore) {}

  checkData(data, statementId) {
    this.validate(data, statementId);
  }

  async validate(data, statementId) {
    const statement = await this.db
      .collection('statements')
      .doc(statementId)
      .get()
      .toPromise();

    const statementObj = statement.data();
    const headerFields = statementObj
      ? statementObj.acceptableFields
      : undefined;

    if (!headerFields || !headerFields.length) {
      this.responseSub.next(false);
      return;
    }
    this.headerFields = headerFields;
    this.responseSub.next(this.validateHeaderRow(data));
  }

  validateHeaderRow(data) {
    const extraFields = ['charges'];
    const isProperLength = (vals) => vals.length === this.headerFields.length;
    const keysAreRight = (keys) => this.headerFields.every((field) => keys.indexOf(field) >= 0);

    const res = data.every((row, i) => {
      const keys = Object.keys(row).filter((field) => !extraFields.includes(field));
      const values = USER_FIELDS.map((field) => row[field]);
      return isProperLength(values) && keysAreRight(keys);
    });
    return res;
  }
}
