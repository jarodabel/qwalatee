import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const headerFields = [
  'first_name',
  'last_name',
  'address',
  'city',
  'state',
  'zip',
];

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  responseSub = new Subject();

  checkData(data) {
    return this.validate(data);
  }

  validate(data) {
    this.responseSub.next(this.validateHeaderRow(data));
  }

  validateHeaderRow(data) {
    const isSame = (row) =>
      row.length == headerFields.length &&
      row.every(function (element, index) {
        return element === headerFields[index];
      });

    const res = data.every((row, i) => {
      if (i === 0) {
        return isSame(row);
      } else {
        return !isSame(row);
      }
    });
    return res;
  }
}
