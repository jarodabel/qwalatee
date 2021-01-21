import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';

@Injectable()
export class UserService {
  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
  ) {}
  userAuth$ = this.afAuth.user.pipe(distinctUntilChanged());

  dbUser$ = this.userAuth$.pipe(
    switchMap((user) => {
      if (user) {
        return this.db
          .collection('users', (ref) => ref.where('email', '==', user.email))
          .valueChanges()
          .pipe(
            map((userArray: {}[]) => {
              return userArray.length ? { ...userArray[0], id: user.uid } : undefined;
            }),
            catchError((error) => {
              console.error('cannot find user', error);
              return of(null);
            })
          );
      }
      return of(undefined);
    }),
  );

  getUser() {
    return this.dbUser$;
  }

  getAllUsers() {
    this.db.collection('users');
  }
}
