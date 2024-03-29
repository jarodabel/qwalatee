import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { from, iif, of } from 'rxjs';
import {
  map,
  mergeMap,
  take,
  tap,
} from 'rxjs/operators';
import { AppState } from '../app-state';
import { selectUser } from '../shared/selectors/user.selectors';
import { UserService } from '../shared/services/user.service';

@Injectable()
export class CanActivateService implements CanActivate {
  user$ = this.store.pipe(select(selectUser));

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(a): any {
    return this.store.pipe(
      select(selectUser),
      mergeMap((user) =>
        iif(
          () => !!user.id,
          of(user),
          from(this.userService.getUser().pipe(take(1)).toPromise())
        )
      ),
      map((user) => {
        return user ? user?.lobPermissions.statements : false;
      }),
      tap((canActivate) => {
        if (!canActivate) {
          this.router.navigate([]);
        }
      })
    );
  }
}
