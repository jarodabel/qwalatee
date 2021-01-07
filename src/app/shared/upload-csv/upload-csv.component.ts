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
        if(currentIndex === 0) {
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
          tempObj = {...merged, charges: []};
          return accumulator;
        }

        // add billing info to object
        // tempObj.charges.push(currentValue);

        return accumulator;
      },
      []
    );

    this.uploadData.emit(userObjects);
  }
}
