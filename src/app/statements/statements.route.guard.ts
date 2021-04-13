import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppState } from '../app-state';
import { selectUser } from '../shared/selectors/user.selectors';

@Injectable()
export class CanActivateService implements CanActivate {
  user$ = this.store.pipe(select(selectUser));

  constructor(
    private store: Store<AppState>,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> {
    return this.store.pipe(
      select(selectUser),
      map((user) => (user ? user.lobStatements : false)),
      tap((canActivate) => {
        if (!canActivate) {
          this.router.navigate([]);
        }
      })
    );
  }
}
