import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  map,
  distinctUntilChanged,
  filter,
  switchMap,
  take,
} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  @ViewChild('navbarBasicMenu', {static: false}) navbarBasicMenu: ElementRef;
  @ViewChild('navbarBurger', {static: false}) navbarBurger: ElementRef;

  userAuth$ = this.afAuth.user.pipe(distinctUntilChanged());

  dbUser$ = this.userAuth$.pipe(
    filter((user) => Boolean(user)),
    switchMap((user) =>
      this.db
        .collection('users', (ref) => ref.where('email', '==', user.email))
        .valueChanges()
    )
  );
  org$ = this.dbUser$.pipe(
    switchMap(([userInfo]: any[]) =>
      this.db.collection('organization').doc(userInfo.organization).get()
    ),
    map((a) => ({ id: a.id, ...a.data() }))
  );

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
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
  }
}
