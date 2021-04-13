import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { USER_FIELDS } from '../../shared/upload-csv/upload-csv.component';
import firebase from 'firebase/app';
@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  responseSub = new Subject();
  headerFields = [];

  fs = firebase.firestore();
  constructor() { }

  checkData(data, statementId) {
    if (!data || !statementId) {
      console.error('validation service; missing data or statementId');
      return;
    }
    this.validate(data, statementId);
  }

  async validate(data, statementId) {
    const statement = await this.fs
      .collection('statements')
      .doc(statementId)
      .get()

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
    // TODO: this array needs to be on the db object
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
