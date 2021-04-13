import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AccessType } from '../../types/access';

import firebase from 'firebase/app';
@Injectable({
  providedIn: 'root',
})
export class StatementService {
  fs = firebase.firestore();
  constructor(
    private db: AngularFirestore
  ) {}

  postStatementHistory(row) {
    return this.db.collection('statement-history').add(row);
  }

  getStatementsById(id) {
    return this.db
      .collection('statement-history', (ref) => ref.where('id', '==', id))
      .get();
  }

  getUploadHistory() {
    return this.fs
      .collection('access')
      .where('filename', '!=', '')
      .where('what', '==', AccessType.STATEMENTS_LOAD_FILE_TEST)
      .where('what', '==', AccessType.STATEMENTS_LOAD_FILE_LIVE)
      .orderBy('filename', 'desc')
      .orderBy('created', 'desc')
      .get();
  }
}
