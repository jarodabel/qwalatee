import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { AngularFirestore } from '@angular/fire/firestore';
import { AppState } from '../app-state';
import { ActivatedRoute } from '@angular/router';
import { addBreadcrumb } from '../shared/actions/shared-actions';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class PdsaService {
  constructor(
    private db: AngularFirestore,
    private store: Store<AppState>,
    private route: ActivatedRoute,
  ) {}
  getOrganization(usersOrg) {
    return this.db.collection('organization').valueChanges({ idField: 'id' });
  }
  async setBreadcrumbs(params) {
    this.store.dispatch(addBreadcrumb({ home: '/' }));
    this.store.dispatch(addBreadcrumb({ organization: params.orgId }));
    this.store.dispatch(addBreadcrumb({ site: params.siteId }));
  }
}
