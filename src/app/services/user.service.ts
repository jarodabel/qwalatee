import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class UserService {
  constructor(    public afAuth: AngularFireAuth,
    private db: AngularFirestore,){

  }
  userAuth$ = this.afAuth.user.pipe(distinctUntilChanged());

  dbUser$ = this.userAuth$.pipe(
    filter((user) => Boolean(user)),
    switchMap((user) =>
      this.db
        .collection('users', (ref) => ref.where('email', '==', user.email))
        .valueChanges()
        .pipe(catchError((error) => of(null)))
    ),
    map((userArray) => userArray[0]),
  );
}
