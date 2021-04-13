import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import firebase from 'firebase/app'
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
  ) {}
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const user = await firebase.auth().currentUser;
    const isLoggedIn = !!user;

    return isLoggedIn;
  }
}

