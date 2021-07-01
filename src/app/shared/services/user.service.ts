import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { AppState } from '../../app-state';
import { setUser } from '../actions/user-actions';
import { selectUser } from '../selectors/user.selectors';
import firebase from 'firebase/app';
import 'firebase/auth';
import { AccessObj, AccessType } from '../../types/access';
import { Subject } from 'rxjs';
import { User } from '../reducers/user.reducers';

const noUser = {
  email: '',
  id: '',
  firstName: '',
  lastName: '',
  organization: '',
  lobPermissions: { admin: false, canMail: false, statements: false, explore: false, history: false, review: false, uploads: false, },
};
@Injectable()
export class UserService {
  userSubject$ = new Subject<any>();

  fs = firebase.firestore();
  user = firebase.auth().onAuthStateChanged((user) => {
    this.userSubject$.next(user);
  });

  constructor(private store: Store<AppState>) {}

  dbUser$ = this.userSubject$.pipe(
    distinctUntilChanged(),

    switchMap(async (user) => {
      if (!user || !user.uid) {
        this.store.dispatch(setUser(noUser))
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

      return { ...matchingUsers[0].data(), id: user.uid } as any;
    }),
    map((_user: any) => {
      const user = {
        email: _user?.email,
        id: _user?.id,
        firstName: _user?.firstname,
        lastName: _user?.lastname,
        organization: _user?.organization,
        lobPermissions: _user?.lob_permissions,
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
    return this.fs.collection('access').add(obj);
  }
}
