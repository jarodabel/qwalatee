import { createSelector } from '@ngrx/store';
import { AppState } from '../../app-state';

export const selectFeature = (state: AppState) => state.breadcrumbs;
export const selectBreadcrumbs = createSelector(
  selectFeature,
  (state: { [key: string]: string }) => state
);
