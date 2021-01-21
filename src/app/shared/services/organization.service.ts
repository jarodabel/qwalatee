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
import { selectUser } from '../../shared/selectors/user.selectors';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  user$ = this.store.pipe(select(selectUser));
  org$ = this.user$.pipe(
    switchMap((userInfo: any) =>
      this.db.collection('organization').doc(userInfo.organization).get()
    ),
    take(1),
    catchError((error) => {
      console.error(error);
      return of(null);
    })
  );

  constructor(private db: AngularFirestore, private store: Store<AppState>) {}

  // createOrganization(name, nameAbbr) {
  //   this.db.collection('organization').add({
  //     name: 'Tokyo',
  //     country: 'Japan',
  //   });
  // }

  getUsersOrganization() {
    return this.org$;
  }
}
