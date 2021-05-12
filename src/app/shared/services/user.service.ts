import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AppState } from '../../app-state';
import { setUser } from '../actions/user-actions';
import { selectUser } from '../selectors/user.selectors';
import firebase from 'firebase/app';
import { AccessObj, AccessType } from '../../types/access';
import { User } from '../reducers/user.reducers';

@Injectable()
export class UserService {
  fs = firebase.firestore();

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private store: Store<AppState>
  ) {}
  userAuth$ = this.afAuth.user;

  dbUser$ = this.userAuth$.pipe(
    distinctUntilChanged(),
    switchMap(async (user) => {
      if (!user) {
        return undefined;
      }
      const query = await this.fs
        .collection('users')
        .where('email', '==', user.email)
        .get();

      const matchingUsers = query.docs;

      if (!matchingUsers || !matchingUsers.length) {
        return undefined;
      }

      return { ...matchingUsers[0].data(), id: user.uid };
    }),
    map((_user: any) => {
      const user = {
        email: _user?.email,
        id: _user?.id,
        firstName: _user?.firstname,
        lastName: _user?.lastname,
        organization: _user?.organization,
        lobStatements: _user?.lob_statements,
        lobStatementsLive: _user?.lob_statements_live,
      };
      this.store.dispatch(setUser(user));
      return user;
    })
  );

  getUser() {
    return this.dbUser$;
  }

  getAllUsers() {
    return this.fs.collection('users').get();
  }

  async postAccessLog(
    what: AccessType,
    patientId: string,
    ltrId = '',
    filename = ''
  ) {
    const user = await this.store.pipe(select(selectUser), take(1)).toPromise();
    const obj: AccessObj = {
      created: firebase.firestore.FieldValue.serverTimestamp(),
      userId: user.id,
      what,
      patientId,
      ltrId,
      filename,
    };
    return this.db.collection('access').add(obj);
  }
}
