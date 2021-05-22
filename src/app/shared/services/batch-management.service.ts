import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { AppState } from '../../app-state';
import { setUploads } from '../actions/statement.actions';
import { UploadObject } from './upload.service';

export enum Env {
  Test = 'Test',
  Live = 'Live',
}

@Injectable({
  providedIn: 'root',
})
export class BatchManagementService {
  fs = firebase.firestore();

  constructor(private store: Store<AppState>) {}

  getPendingBatches() {
    return new Observable<{ [key: string]: UploadObject[] }>((observer) => {
      const unsubscribe = this.fs
        .collection('uploads')
        .where('mailComplete', '==', false)
        .orderBy('dateCreated', 'desc')
        .onSnapshot((_snapshot) => {
          const snapshot = _snapshot.docs;
          const uploads = [];
          snapshot.forEach((doc) => {
            uploads.push({ id: doc.id, ...doc.data() });
          });
          this.store.dispatch(setUploads({ uploads }));
          const res = uploads.reduce((acc, cur) => {
            const date = new Date(cur.dateCreated.seconds * 1000);
            const key = `${date.getFullYear()}-${
              date.getMonth() + 1
            }-${date.getDate()}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(cur);
            return acc;
          }, {});
          return observer.next(res);
        });
      return unsubscribe;
    });
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

          this.deleteStatementCharges(records);
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

  private deleteStatementCharges(records) {
    return new Promise((resolve, reject) => {
      records.forEach((record) => {
        this.fs
          .collection('statement-charges')
          .where('recordId', '==', record.id)
          .get()
          .then((charges) => {
            const batch = this.fs.batch();
            charges.forEach((charge) => {
              const doc = this.fs
                .collection('statement-charges')
                .doc(charge.id);
              batch.delete(doc);
            });
            batch
              .commit()
              .then(() => {
                resolve('Successfully deleted statement charge');
              })
              .catch(() => {
                reject(new Error('Error Deleting Statement charge'));
              });
          })
          .catch(() => {
            reject(new Error('Cannot find statement charges'));
          });
      });
    });
  }

  getRecordsByUploadId(id: string) {
    return this.fs
      .collection('statement-records')
      .where('uploadId', '==', id)
      .get();
  }

  getCharges(ids: string[]) {
    return this.fs
      .collection('statement-charges')
      .where('recordId', 'in', ids)
      .get();
  }

  setRecordAsTestView(recordId: string, ltrId: string) {
    return this.fs.collection('statement-records').doc(recordId).update({
      testView: true,
      ltrId,
    });
  }

  mapCharges(charges) {
    return charges
      .sort((a, b) => {
        return a.index - b.index;
      })
      .reduce((acc, cur) => {
        if (!acc[cur.recordId]) {
          acc[cur.recordId] = [];
        }
        acc[cur.recordId].push(cur.charges);
        return acc;
      }, {});
  }
}
