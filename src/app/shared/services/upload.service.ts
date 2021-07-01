import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { Subject } from 'rxjs';
import { AccessType } from '../../types/access';
import { PatientRecord } from '../../types/data-models';
import { StatementService } from './statement.service';
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
  UpdateUploadObject = 'Updating Upload Object',
  UpdateUploadObjectDone = 'Updating Upload Object Complete',
  UpdateUploadObjectError = 'Updating Upload Object Error',

  Complete = 'Batch Upload Is Complete',
}

type ReviewStatement = {
  user: string;
  recordId: string;
  approved: boolean;
};

type ReviewStatements = {
  one: ReviewStatement;
  two: ReviewStatement;
  three: ReviewStatement;
};

export type UploadObject = {
  count: number;
  dateCreated: firebase.firestore.Timestamp;
  filename: string;
  id: string;
  reviewStatements: ReviewStatements;
  reviewApprovedBy: string;
  reviewIsComplete: boolean;
  mailHasStarted: boolean;
  mailHasErrors: boolean;
  mailComplete: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  uploadStatus$ = new Subject<UploadSteps>();
  fs = firebase.firestore();

  constructor(
    private userService: UserService,
    private statementService: StatementService
  ) {}

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
    // upload check records for review
    try {
      await this.establishCheckRecords(uploadDbObject.id, parsedData);
    } catch (err) {
      throw err;
    }
    // mark upload complete in access table
    this.userService.postAccessLog(
      AccessType.STATEMENTS_BATCH_UPLOADED,
      '',
      undefined,
      filename
    );

    this.uploadStatus$.next(UploadSteps.Complete);
  }

  parseUpload(rawData) {
    const chunks = this.split(rawData);

    let tempObj: PatientRecord = {};
    let newPatient = false;

    const totalRows = chunks.length;
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

        // last row
        if (totalRows === currentIndex + 1) {
          accumulator.push(tempObj);
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

    const reviewStatementTemplate = {
      user: null,
      recordId: '',
      approved: false,
    };
    return {
      count,
      dateCreated,
      filename,
      reviewStatements: {
        one: { ...reviewStatementTemplate },
        two: { ...reviewStatementTemplate },
        three: { ...reviewStatementTemplate },
      },
      reviewApprovedBy: null,
      reviewIsComplete: false,
      mailHasStarted: false,
      mailHasErrors: false,
      mailComplete: false,
    };
  }

  establishCheckRecords(id, records) {
    return new Promise((resolve, reject) => {
      this.uploadStatus$.next(UploadSteps.UpdateUploadObject);

      const chargesArr = [...records].sort(
        (a, b) => Object.keys(a.charges).length - Object.keys(b.charges).length
      );
      const len = chargesArr.length;
      const min = chargesArr[0] || {recordId: null, approved: true};
      const max = len > 1 ? chargesArr[len - 1] : {recordId: null, approved: true};
      const med = len > 2 ? chargesArr[Math.round(len / 2)] : {recordId: null, approved: true};

      const update = {
        'reviewStatements.one.recordId': min.recordId,
        'reviewStatements.one.approved': min?.approved || false,
        'reviewStatements.two.recordId': med.recordId,
        'reviewStatements.two.approved': med?.approved || false,
        'reviewStatements.three.recordId': max.recordId,
        'reviewStatements.three.approved': max?.approved || false,
      };
      this.statementService
        .updateUploadRecord(id, update)
        .then((res) => {
          this.uploadStatus$.next(UploadSteps.UpdateUploadObjectDone);
          resolve(res);
        })
        .catch((err) => {
          this.uploadStatus$.next(UploadSteps.UpdateUploadObjectError);
          reject(new Error(ValidationErrorTypes.Upload_GeneralError));
        });
    });
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

  uploadRecords(uploadId, _records) {
    return new Promise((resolve, reject) => {
      this.uploadStatus$.next(UploadSteps.UploadRecordsBeginning);

      const records = [..._records];
      // TODO: test this
      const chunks = [];
      while (records.length > 0) {
        chunks.push(records.splice(0, 499));
      }

      const promises = chunks.map((chunk, chunkIndex) => {
        const batch = this.fs.batch();
        chunk.forEach((_record, i) => {
          this.uploadStatus$.next(UploadSteps.UploadingRecord);
          const charges = _record.charges.reduce((acc, cur, i) => {
            acc[i] = cur;
            return acc;
          }, {});

          const record = { ..._record, uploadId, charges };
          const recordDoc = this.fs.collection('statement-records').doc();

          const index = chunkIndex * 500 + i;
          _records[index].recordId = recordDoc.id;

          batch.set(recordDoc, record);
        });
        return batch.commit();
      });

      Promise.all(promises)
        .then(() => {
          this.uploadStatus$.next(UploadSteps.UploadComplete);
          resolve('');
        })
        .catch((err) => {
          console.error(err);
          this.uploadStatus$.next(UploadSteps.UploadError);
          reject(new Error(ValidationErrorTypes.Upload_GeneralError));
        });
    });
  }
}
