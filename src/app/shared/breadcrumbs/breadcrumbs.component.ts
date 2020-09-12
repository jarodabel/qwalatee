import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { tap, filter, distinctUntilChanged, delay } from 'rxjs/operators';
import { Store, select, On } from '@ngrx/store';
import { selectBreadcrumbs } from '../selectors/selectors';
import { AppState } from '../../app-state';
import {
  resetBreadcrumb,
  removeBreadcrumb,
} from '../actions/shared-actions';

@Component({
  selector: 'breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent {
  orgId;
  siteId;
  pdsaId;
  breadcrumbs$ = this.store.pipe(
    select(selectBreadcrumbs),
    delay(0),
    tap((crumbs) => {
      this.orgId = crumbs.organization;
      this.siteId = crumbs.site;
      this.pdsaId = crumbs.pdsaId;
    })
  );
  constructor(private store: Store<AppState>) {}
  homeClicked() {
    this.store.dispatch(removeBreadcrumb({keysToRemove: ['organization', 'site', 'pdsaId'], next: '/'}));
  }
  orgClicked() {
    this.store.dispatch(removeBreadcrumb({keysToRemove: ['site', 'pdsaId'], next: `/organization/${this.orgId}`}));
  }
  pdsaClicked() {
    this.store.dispatch(removeBreadcrumb({keysToRemove: ['pdsaId'], next: `/organization/${this.orgId}/site/${this.siteId}`}));
  }
}
