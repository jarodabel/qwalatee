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

    console.log(headerFields)
    if (!headerFields || !headerFields.length) {
      this.responseSub.next(false);
      return;
    }
    this.headerFields = headerFields;
    this.responseSub.next(this.validateHeaderRow(data));
  }

  validateHeaderRow(data) {
    const headerRowIsCorrect = (row) => {
      return row.every((heading) => this.headerFields.indexOf(heading) >= 0);
    }
    const isProperLength = (row) => row.length === this.headerFields.length;

    const res = data.every((row, i) => {
      if (i === 0) {
        return isProperLength(row) && headerRowIsCorrect(row);
      } else {
        return isProperLength(row);
      }
    });
    return res;
  }
}
