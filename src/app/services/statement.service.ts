import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class StatementService {
  private batchList = [];
  constructor(private db: AngularFirestore) {}
  postStatementHistory(row, batch) {
    // if(batch === 1){}
    return this.db.collection('statement-history').add(row);
  }
}
