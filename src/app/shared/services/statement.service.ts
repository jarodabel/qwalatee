import { Injectable } from '@angular/core';
import { AccessType } from '../../types/access';

import firebase from 'firebase/app';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
@Injectable({
  providedIn: 'root',
})
export class StatementService {
  fs = firebase.firestore();
  constructor() {}

  postStatementHistory(row) {
    return this.fs.collection('statement-history').add(row);
  }

  getStatementsById(id) {
    return this.fs.collection('statement-history').where('id', '==', id).get();
  }

  getUploadHistory() {
    return this.fs
      .collection('access')
      .where('filename', '!=', '')
      .where('what', 'in', [
        AccessType.STATEMENTS_LOAD_FILE_TEST,
        AccessType.STATEMENTS_LOAD_FILE_LIVE,
      ])
      .get();
  }

  getStatementsByUploadId(id: string) {
    return this.fs
      .collection('statement-history')
      .where('uploadId', '==', id)
      .get();
  }

  getAccessObjById(id: string) {
    return this.fs.collection('access').doc(id).get();
  }

  updateUploadRecord(id: string, update) {
    return this.fs.collection('uploads').doc(id).update(update);
  }
}
