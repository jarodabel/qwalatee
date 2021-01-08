import { Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { PatientRecord } from '../../types/data-models';
export const USER_FIELDS = [
  'first',
  'm',
  'last',
  'date',
  'id',
  'amtDue',
  'firstGuar',
  'mGuar',
  'lastGuar',
  'add1',
  'add2',
  'city',
  'state',
  'zip',
  'fac',
  'facAdd1',
  'facAdd2',
  'facCity',
  'facState',
  'facZip',
  'company',
  'unknown1',
  'unknown2',
  'unknown3',
  'unknown4',
  'unknown5',
  'unknown6',
  'unknown7',
  'billNum',
];
@Component({
  selector: 'upload-csv',
  templateUrl: './upload-csv.component.html',
  styleUrls: [],
})
export class UploadCSVComponent {
  @Output()
  uploadData = new EventEmitter();
  filename = '';

  handleFileSelect(evt) {
    const onload = (event) => {
      const csv = event.target.result; // Content of CSV file
      this.extractData(csv);
    };
    onload.bind(this);

    const files = evt.target.files; // FileList object
    this.filename = evt.target.files[0].name;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = onload;
    reader.readAsText(file);
  }

  extractData(data) {
    const breaks = 'ecwPtStatement';
    const allTextLines = data.split(/\n/);
    const firstBreakPoint = allTextLines.indexOf(breaks);
    const statementChunks = allTextLines.slice(firstBreakPoint);
    let tempObj: PatientRecord = {};
    let newPatient = false;

    const userObjects = statementChunks.reduce(
      (accumulator, currentValue, currentIndex) => {
        // first one
        if (currentIndex === 0) {
          newPatient = true;
          return accumulator;
        }

        // new object
        if (currentValue === breaks) {
          newPatient = true;
          accumulator.push(tempObj);
          tempObj = {};
          return accumulator;
        }

        // add user data to new object
        if (newPatient) {
          newPatient = false;
          const currentValueArr = currentValue.replace(/['"]+/g, '').split(',');
          const merged = USER_FIELDS.reduce(
            (obj, key, index) => ({ ...obj, [key]: currentValueArr[index] }),
            {}
          );
          tempObj = { ...merged, charges: [] };
          return accumulator;
        }

        // add billing info to object
        const htmlRow = this.getHtmlRow(currentValue);
        if (htmlRow) {
          console.log(htmlRow);
          tempObj.charges.push(htmlRow);
        }

        return accumulator;
      },
      []
    );

    this.uploadData.emit(userObjects);
  }

  private merge(keys, values) {
    return keys.reduce(
      (obj, key, index) => ({ ...obj, [key]: values[index] }),
      {}
    );
  }

  private csvToArray(text) {
    let p = '',
      row = [''],
      ret = [row],
      i = 0,
      r = 0,
      s = !0,
      l;
    for (l of text) {
      if ('"' === l) {
        if (s && l === p) row[i] += l;
        s = !s;
      } else if (',' === l && s) l = row[++i] = '';
      else if ('\n' === l && s) {
        if ('\r' === p) row[i] = row[i].slice(0, -1);
        row = ret[++r] = [(l = '')];
        i = 0;
      } else row[i] += l;
      p = l;
    }
    return ret;
  }

  private getHtmlRow(data) {
    const values = this.csvToArray(data);

    console.log('uncaught', values);
    return values;
  }
}
