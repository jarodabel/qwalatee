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
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt: 'select_account'})
    firebase.auth()
      .signInWithPopup(provider)
      .then(
        (a) => {
        },
        (err) => {
          console.error('error');
        }
      );
  }
}
