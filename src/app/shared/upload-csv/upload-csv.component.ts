import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PatientRecord } from '../../types/data-models';
import { UploadService, USER_FIELDS } from '../services/upload.service';

@Component({
  selector: 'upload-csv',
  templateUrl: './upload-csv.component.html',
  styleUrls: [],
})
export class UploadCSVComponent implements OnInit, OnDestroy {
  @Output()
  uploadData = new EventEmitter();
  @Input()
  reset: Subject<undefined>;
  destroy$ = new Subject();
  filename = '';
  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    this.reset.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.filename = undefined;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleFileSelect(evt) {
    const onload = (event) => {
      const csv = event.target.result; // Content of CSV file
      this.uploadData.emit({ filename: this.filename, data: csv });
      // this.uploadService.upload(this.filename, csv)
      // this.extractData(csv);
    };
    onload.bind(this);

    const files = evt.target.files; // FileList object
    this.filename = evt.target.files[0].name;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = onload;
    reader.readAsText(file);
    evt.target.value = '';
  }

  private extractData(data) {
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
        const rowData = this.csvToArray(currentValue);
        if (rowData) {
          tempObj.charges.push(rowData);
        }

        return accumulator;
      },
      []
    );

    const dataToEmit = {
      data: userObjects,
      filename: this.filename,
    };

    this.uploadData.emit(dataToEmit);
  }

  private csvToArray(text) {
    let p = '';
    let row = [''];
    const ret = [row];
    let i = 0;
    let r = 0;
    let s = !0;
    let l: any;
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
    return ret[0];
  }
}
