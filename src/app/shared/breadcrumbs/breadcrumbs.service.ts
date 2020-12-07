import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { Router } from '@angular/router';
import { removeBreadcrumb } from '../actions/shared-actions';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  @Effect({
    dispatch: false,
  })
  breadcrumbUpdate$ = this.actions.pipe(
    ofType(removeBreadcrumb),
    tap((payload) => {
      this.router.navigate([payload.next]);
  }));
  constructor(private router: Router, private actions: Actions) {}
}
