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
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  org$ = this.userService.dbUser$.pipe(
    switchMap((userInfo: any) =>
      this.db.collection('organization').doc(userInfo.organization).get()
    ),
    catchError((error) => {
      console.log(error)
      return of(null);
    })
  );

  constructor(private db: AngularFirestore, private userService: UserService) {}

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
