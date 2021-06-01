import { createSelector } from '@ngrx/store';
import { AppState } from '../../app-state';
import { User } from '../reducers/user.reducers';

const selectStateUser = (state: AppState) => state.user;

export const selectUser = createSelector(
  selectStateUser,
  (user) => user,
);

export const selectCurrentUserHasLobPermission = (permission) => createSelector(
  selectStateUser,
  (user) => {
    const permissions = user.lobPermissions;
    if(!permission || !permissions){
      return false;
    }
    return permissions[permission];
  },
);
