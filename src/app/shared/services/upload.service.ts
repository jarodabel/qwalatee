import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { of, Subject } from 'rxjs';
import { AccessType } from '../../types/access';
import { PatientRecord } from '../../types/data-models';
import { UserService } from './user.service';

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

const DELIMITER = 'ecwPtStatement';

export enum ValidationErrorTypes {
  Filename_MissingFilenameOrData = 'Upload missing filename or data',
  Filename_MissingFilenameExtension = 'Filename is missing an extension',
  Filename_InvalidFileExtension = 'Invalid file extension',
  RawData_MissingDelimiter = 'Input data is missing valid delimiter',
  RawData_NotEnoughData = 'Input data is not complete',
  Upload_GeneralError = 'Upload to database failed',
}

export enum UploadSteps {
  ValidationBegin = 'Beginning File Validation',
  ValidationError = 'File Validation Error',
  ValidationComplete = 'File Validation Complete',
  ParseBegin = 'Parsing Data',
  ParseComplete = 'Parsing Data Complete',
  ParseError = 'Parsing Data Error',
  DataCount = 'Data Count Total',
  UploadBegin = 'Upload Beginning',
  UploadComplete = 'Upload Complete',
  UploadError = 'Upload Error',
  UploadRecordsBeginning = 'Beginning Statement Upload',
  UploadingRecord = 'Record Upload',
  Complete = 'Batch Upload Is Complete',
}

export type UploadObject = {
  count: number;
  dateCreated: firebase.firestore.Timestamp;
  filename: string;
  hasBeenMailed: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  uploadStatus$ = new Subject();
  fs = firebase.firestore();

  constructor(private userService: UserService) {}

  async upload(filename, rawData) {
    try {
      this.uploadStatus$.next(UploadSteps.ValidationBegin);
      this.validateInput(filename, rawData);
    } catch (err) {
      this.uploadStatus$.next(UploadSteps.ValidationError);
      throw err;
    }
    this.uploadStatus$.next(UploadSteps.ValidationComplete);
    this.uploadStatus$.next(UploadSteps.ParseBegin);
    const parsedData = this.parseUpload(rawData);
    this.uploadStatus$.next(UploadSteps.ParseComplete);

    this.uploadStatus$.next(UploadSteps.DataCount);

    let uploadDbObject;
    try {
      uploadDbObject = await this.uploadToDb(filename, parsedData);
    } catch (err) {
      throw err;
    }

    // upload records for this batch
    await this.uploadRecords(uploadDbObject.id, parsedData);
    // mark upload complete in access table
    this.userService.postAccessLog(
      AccessType.STATEMENTS_BATCH_UPLOADED,
      undefined,
      undefined,
      filename
    );
  }

  parseUpload(rawData) {
    const chunks = this.split(rawData);

    let tempObj: PatientRecord = {};
    let newPatient = false;

    const userObjects = chunks.reduce(
      (accumulator, currentValue, currentIndex) => {
        // first one
        if (currentIndex === 0) {
          newPatient = true;
          return accumulator;
        }

        // new object
        if (currentValue === DELIMITER) {
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

    return userObjects;
  }

  createUploadObject(filename, data) {
    const dateCreated = firebase.firestore.FieldValue.serverTimestamp();
    const count = data.length;

    return {
      count,
      dateCreated,
      filename,
      hasBeenMailed: false,
    };
  }

  verifyMostRecentUpload() {}

  private split(rawData) {
    const textSplitByNewLine = rawData.split(/\n/);
    const firstInstanceOfDelimiter = textSplitByNewLine.indexOf(DELIMITER);
    return textSplitByNewLine.slice(firstInstanceOfDelimiter);
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

  validateInput(filename, rawData) {
    // filename
    if (!filename || !rawData) {
      throw new Error(ValidationErrorTypes.Filename_MissingFilenameOrData);
    }
    const filenameParts = filename.split('.');
    if (!filenameParts || filenameParts.length === 1) {
      throw new Error(ValidationErrorTypes.Filename_MissingFilenameExtension);
    }
    const extension = filenameParts[filenameParts.length - 1];
    if (extension !== 'txt') {
      throw new Error(ValidationErrorTypes.Filename_InvalidFileExtension);
    }

    // data
    if (!rawData.includes(DELIMITER)) {
      throw new Error(ValidationErrorTypes.RawData_MissingDelimiter);
    }
    const chunks = this.split(rawData);
    if (chunks.length <= 1) {
      throw new Error(ValidationErrorTypes.RawData_NotEnoughData);
    }
  }

  uploadToDb(filename, dataObj) {
    return new Promise((resolve, reject) => {
      this.uploadStatus$.next(UploadSteps.UploadBegin);

      const dbObject = this.createUploadObject(filename, dataObj);

      this.fs
        .collection('uploads')
        .add(dbObject)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          this.uploadStatus$.next(UploadSteps.UploadError);
          reject(new Error(ValidationErrorTypes.Upload_GeneralError));
        });
    });
  }

  uploadRecords(uploadId, records) {
    return new Promise((resolve, reject) => {
      const batch = this.fs.batch();
      this.uploadStatus$.next(UploadSteps.UploadRecordsBeginning);

      records.forEach((_record, i) => {
        this.uploadStatus$.next(UploadSteps.UploadingRecord);
        const doc = this.fs.collection('statement-records').doc();
        const record = { ..._record, uploadId };
        delete record.charges;
        // const charges = record.charges;
        // if we want to keep charges / display them on the statement here is where we will have to save them to the db.
        batch.set(doc, record);
      });
      batch
        .commit()
        .then(() => {
          this.uploadStatus$.next(UploadSteps.UploadComplete);
          this.uploadStatus$.next(UploadSteps.Complete);
          resolve('');
        })
        .catch((err) => {
          this.uploadStatus$.next(UploadSteps.UploadError);
          reject(new Error(ValidationErrorTypes.Upload_GeneralError));
        });
    });
  }


}
