import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  map,
  distinctUntilChanged,
  filter,
  switchMap,
  take,
  tap,
  catchError,
} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../app-state';
import { selectUser } from '../selectors/user.selectors';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  @ViewChild('navbarBasicMenu') navbarBasicMenu: ElementRef;
  @ViewChild('navbarBurger') navbarBurger: ElementRef;
  @ViewChild('settingsMenu') settingsMenu: ElementRef;

  userAuth$ = this.afAuth.user.pipe(distinctUntilChanged());

  user$ = this.store.pipe(select(selectUser));

  org$ = this.user$.pipe(
    switchMap((userInfo: any) =>
      this.db.collection('organization').doc(userInfo.organization).get()
    ),
    map((a) => ({ id: a.id, ...a.data() }))
  );

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private store: Store<AppState>,
    private router: Router
  ) {}

  async goToOrg(event) {
    const organization = await this.org$.pipe(take(1)).toPromise();
    this.router.navigate(['/', 'organization', organization.id]);
    this.hideNavbarMenu();
  }

  openMenu(event) {
    this.navbarBurger.nativeElement.classList.toggle('is-active');
    this.navbarBasicMenu.nativeElement.classList.toggle('is-active');
  }

  hideNavbarMenu() {
    this.navbarBurger.nativeElement.classList.remove('is-active');
    this.navbarBasicMenu.nativeElement.classList.remove('is-active');
    // this.settingsMenu.nativeElement.classList.remove('is-active');
  }

  logIn() {
    this.afAuth.auth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(
        (a) => {
          this.router.navigate(['/']);
        },
        (err) => {
          console.error('error');
        }
      );
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.hideNavbarMenu();
  }

  openSettingsMenu() {
    this.settingsMenu.nativeElement.classList.toggle('is-active');
  }
}
