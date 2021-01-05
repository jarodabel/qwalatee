import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable()
export class CanActivateService implements CanActivate {
  user$ = this.userService.dbUser$;

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> {
    return this.userService.dbUser$.pipe(
      map((user) => (user ? user.lob_statements : false)),
      tap((hasLobPermission) => {
        if (!hasLobPermission) {
          this.router.navigate([]);
        }
      })
    );
  }
}
