import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { of } from 'rxjs';

export enum Env {
  Test = 'Test',
  Live = 'Live'
}

@Injectable({
  providedIn: 'root',
})
export class BatchManagementService {
  fs = firebase.firestore();

  constructor() {}

  getPendingBatches() {
    return this.fs
      .collection('uploads')
      .where('hasBeenMailed', '==', false)
      .orderBy('dateCreated', 'desc')
      .get();
  }

  deleteUpload(id: string) {
    if (!id) {
      return of(false);
    }
    return this.fs.collection('uploads').doc(id).delete();
  }

  deleteStatementRecords(id: string) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject('Missing Upload Id');
      }
      this.fs
        .collection('statement-records')
        .where('uploadId', '==', id)
        .get()
        .then((records) => {
          const batch = this.fs.batch();

          records.forEach((record) => {
            const doc = this.fs.collection('statement-records').doc(record.id);
            batch.delete(doc);
          });
          batch
            .commit()
            .then(() => {
              resolve('Successfully deleted statement records');
            })
            .catch(() => {
              reject(new Error('Error Deleting Statement Records'));
            });
        })
        .catch(() => {
          reject(new Error('Cannot find statement records'));
        });
    });
  }

  getRecordsByUploadId(id: string) {
    return this.fs.collection('statement-records').where('uploadId', '==', id).get();
  }
}
