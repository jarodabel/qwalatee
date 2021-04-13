import { Directive, HostListener } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/auth';
@Directive({
  selector: '[appGoogleSignin]',
})
export class GoogleSigninDirective {
  constructor() {}

  @HostListener('click')
  onclick() {
    firebase.auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(
        (a) => {
        },
        (err) => {
          console.error('error');
        }
      );
  }
}
