import { createSelector } from '@ngrx/store';
import { AppState } from '../../app-state';
import { User } from '../reducers/user.reducers';

const selectStateUser = (state: AppState) => state.user;

export const selectUser = createSelector(
  selectStateUser,
  (user) => user,
);
