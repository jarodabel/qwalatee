import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { AppState } from '../../app-state';
import { setUser } from '../actions/user-actions';
import { selectUser } from '../selectors/user.selectors';
import * as firebase from 'firebase';
import { AccessObj, AccessType } from '../../types/access';

@Injectable()
export class UserService {
  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private store: Store<AppState>
  ) {}
  userAuth$ = this.afAuth.user;

  dbUser$ = this.userAuth$.pipe(
    switchMap((user) => {
      if (user) {
        return this.db
          .collection('users', (ref) => ref.where('email', '==', user.email))
          .valueChanges()
          .pipe(
            map((userArray: {}[]) => {
              console.log('wtf')
              return userArray.length
                ? { ...userArray[0], id: user.uid }
                : undefined;
            }),
            catchError((error) => {
              console.error('cannot find user', error);
              return of(undefined);
            })
          );
      }
      return of(undefined);
    }),
    filter((user) => user),
    tap((_user) => {
      const user = {
        email: _user.email,
        id: _user.id,
        firstName: _user.firstname,
        lastName: _user.lastname,
        organization: _user.organization,
        lobStatements: _user.lob_statements,
      };
      this.store.dispatch(setUser(user));
    })
  );

  getUser() {
    return this.dbUser$;
  }

  getAllUsers() {
    this.db.collection('users');
  }

  async postAccessLog(what: AccessType, patientId: string, ltrId = '') {
    const user = await this.store.pipe(select(selectUser), take(1)).toPromise();
    const obj: AccessObj = {
      created: firebase.firestore.FieldValue.serverTimestamp(),
      userId: user.id,
      what,
      patientId,
      ltrId,
    };
    this.db.collection('access').add(obj);
  }
}
