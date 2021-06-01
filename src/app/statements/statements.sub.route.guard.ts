import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { from, iif, of } from 'rxjs';
import {
  map,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { AppState } from '../app-state';
import { selectCurrentUserHasLobPermission, selectUser } from '../shared/selectors/user.selectors';
import { UserService } from '../shared/services/user.service';
import { RoutePermissionMap } from './statements.types';

@Injectable()
export class CanActivateSubRouteService implements CanActivate {
  user$ = this.store.pipe(select(selectUser));

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(a): any {
    console.log(a.routeConfig.path);
    return this.store.pipe(
      select(selectUser),
      mergeMap((user) =>
        iif(
          () => !!user.id,
          of(user),
          from(this.userService.getUser().pipe(take(1)).toPromise())
        )
      ),
      map(() => {
        const route = a.routeConfig.path;
        if(!route){
          return undefined;
        }
        const first = route.split('/')[0];
        return RoutePermissionMap[first];
      }),
      switchMap((permission) => this.store.pipe(select(selectCurrentUserHasLobPermission(permission)))),
      tap((canActivate) => {
        if (!canActivate) {
          this.router.navigate([]);
        }
      })
    );
  }
}
