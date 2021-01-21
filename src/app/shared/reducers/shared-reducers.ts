import { createReducer, props, on, Action } from '@ngrx/store';
import * as breadcrumbActions from '../actions/shared-actions';
import { AppState } from '../../app-state';
import { state } from '@angular/animations';

interface BreadcrumbState {
  home?: string;
  location?: string;
  organization?: string;
}

const initialState: BreadcrumbState = {};

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
    rest.keysToRemove.forEach((key) => {
      delete newCrumbs[key];
    });
    return {
      ...newCrumbs,
    };
  }),
  on(breadcrumbActions.resetBreadcrumb, () => {
    return {};
  })
);

export function breadcrumbReducerFn(
  breadCrumbs: BreadcrumbState | undefined,
  action: Action
) {
  return breadcrumbReducer(breadCrumbs, action);
}
