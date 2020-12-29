import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  userAuth$ = this.afAuth.user.pipe(distinctUntilChanged());

  dbUser$ = this.userAuth$.pipe(
    filter((user) => Boolean(user)),
    switchMap((user) =>
      this.db
        .collection('users', (ref) => ref.where('email', '==', user.email))
        .valueChanges()
        .pipe(catchError((error) => of(null)))
    ),
    map((userArray) => {
      return userArray ? userArray[0] : false;
    })
  );

  org$ = this.dbUser$.pipe(
    switchMap((userInfo: any) =>
      this.db.collection('organization').doc(userInfo.organization).get()
    )
  );

  constructor(private db: AngularFirestore, public afAuth: AngularFireAuth) {}

  createOrganization(name, nameAbbr) {
    this.db.collection('organization').add({
      name: 'Tokyo',
      country: 'Japan',
    });
  }

  getUsersOrganization() {
    return this.org$;
  }
}
