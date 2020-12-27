import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private db: AngularFirestore) {}
  createOrganization(name, nameAbbr) {
    this.db.collection('organization').add({
      name: 'Tokyo',
      country: 'Japan',
    });
  }
}
