import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../app-state';
import { selectUser } from '../selectors/user.selectors';
import { logoutUser } from '../actions/user-actions';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  @ViewChild('navbarBasicMenu') navbarBasicMenu: ElementRef;
  @ViewChild('navbarBurger') navbarBurger: ElementRef;
  @ViewChild('settingsMenu') settingsMenu: ElementRef;

  user$ = this.store.pipe(select(selectUser));

  org$ = this.user$.pipe(
    switchMap((userInfo: any) =>
      this.db.collection('organization').doc(userInfo.organization).get()
    ),
    map((a) => ({ id: a.id, ...a }))
  );

  constructor(
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
    // settings menu
    if(this.settingsMenu){
      this.settingsMenu.nativeElement.classList.remove('is-active');
    }
  }

  logIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt: 'select_account'})
    firebase.auth()
      .signInWithPopup(provider)
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
    this.store.dispatch(logoutUser());
    firebase.auth().signOut();
    this.hideNavbarMenu();
  }

  openSettingsMenu() {
    this.settingsMenu.nativeElement.classList.toggle('is-active');
  }
}
