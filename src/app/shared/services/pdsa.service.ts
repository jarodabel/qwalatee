import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import firebase from 'firebase';
import { AppState } from '../../app-state';
import { addBreadcrumb } from '../actions/shared-actions';


@Injectable({
  providedIn: 'root',
})
export class PdsaService {
  fs = firebase.firestore();
  constructor(private store: Store<AppState>) {}

  setBreadcrumbs(params) {
    this.store.dispatch(addBreadcrumb({ home: '/' }));
    this.store.dispatch(addBreadcrumb({ organization: params.orgId }));
    this.store.dispatch(addBreadcrumb({ site: params.siteId }));
  }

  getPdsaById(id: string){
    return this.fs.collection('pdsa').doc(id).get()
  }
}
