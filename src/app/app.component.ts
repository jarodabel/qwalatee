import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { tap, filter, distinctUntilChanged, delay } from 'rxjs/operators';
import { Store, select, On } from '@ngrx/store';
import { selectBreadcrumbs } from './shared/selectors/selectors';
import { AppState } from './app-state';
import {
  resetBreadcrumb,
  removeBreadcrumb,
} from './shared/actions/shared-actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('constructionNotification', {static: false}) constructionNotification: ElementRef;
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
    this.store.dispatch(removeBreadcrumb({keyToRemove: 'organization'}));
    this.store.dispatch(removeBreadcrumb({keyToRemove: 'site'}));
    this.store.dispatch(removeBreadcrumb({keyToRemove: 'pdsaId'}));
  }
  orgClicked() {
    this.store.dispatch(removeBreadcrumb({keyToRemove: 'site'}));
    this.store.dispatch(removeBreadcrumb({keyToRemove: 'pdsaId'}));
  }
  pdsaClicked() {
    this.store.dispatch(removeBreadcrumb({keyToRemove: 'pdsaId'}));
  }
  close() {
    this.constructionNotification.nativeElement.remove();
  }
}
