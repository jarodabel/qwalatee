import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import firebase from 'firebase'
import { AppState } from '../../app-state';
import { selectUser } from '../../shared/selectors/user.selectors';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  fs = firebase.firestore();
  user$ = this.store.pipe(select(selectUser));
  org$ = this.user$.pipe(
    switchMap((userInfo: any) =>
      this.fs.collection('organization').doc(userInfo.organization).get()
    ),
    take(1),
    catchError((error) => {
      console.error(error);
      return of(null);
    })
  );

  constructor(private store: Store<AppState>) {}

  getUsersOrganization() {
    return this.org$;
  }
}
