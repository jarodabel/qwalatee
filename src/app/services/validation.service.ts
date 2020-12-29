import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  responseSub = new Subject();
  headerFields = [];

  constructor(private db: AngularFirestore) {}

  checkData(data, statementId) {
    console.log(data);
    this.validate(data, statementId);
  }

  async validate(data, statementId) {
    const statement = await this.db
      .collection('statements')
      .doc(statementId)
      .get()
      .toPromise();

    const statementObj = statement.data();
    console.log(statementObj);
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
    const isSame = (row) =>
      row.length === this.headerFields.length &&
      row.every((element, index) => {
        return element === this.headerFields[index];
      });

    const res = data.every((row, i) => {
      if (i === 0) {
        return isSame(row);
      } else {
        return !isSame(row);
      }
    });
    console.log(res)
    return res;
  }
}
