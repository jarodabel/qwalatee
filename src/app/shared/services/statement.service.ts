import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class StatementService {
  constructor(private db: AngularFirestore) {}
  postStatementHistory(row) {
    return this.db.collection('statement-history').add(row);
  }

  getStatementsById(id) {
    return this.db
      .collection('statement-history', (ref)=> ref.where('id', '==', id))
      .get()
  }
}
