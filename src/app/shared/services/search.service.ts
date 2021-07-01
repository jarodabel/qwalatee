import { Injectable } from '@angular/core';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  fs = firebase.firestore();

  constructor() {}

  searchByPatientId(id) {
    return this.fs.collection('statement-records').where('id', '==', id).get();
  }
}





































0
