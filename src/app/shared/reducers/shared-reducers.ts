import { createReducer, props, on, Action } from '@ngrx/store';
import * as breadcrumbActions from '../actions/shared-actions';
import { AppState } from '../../app-state';
import { state } from '@angular/animations';

interface BreadcrumbState {
  home?: string;
  location?: string;
  organization?: string;
}

export const initialState: BreadcrumbState = {};

const breadcrumbReducer = createReducer(
  initialState,
  on(breadcrumbActions.addBreadcrumb, (state, { type, ...rest }) => {
    const newCrumbs = { ...state, ...rest };
    return {
      ...state,
      ...newCrumbs,
    };
  }),
  on(breadcrumbActions.removeBreadcrumb, (state, { type, ...rest }) => {
    const newCrumbs = { ...state };
    delete newCrumbs[rest.keyToRemove];
    return {
      ...newCrumbs,
    };
  }),
  on(breadcrumbActions.resetBreadcrumb, () => {
    return {};
  })
);

export function reducer(state: AppState | undefined, action: Action) {
  return breadcrumbReducer(state, action);
}
