import { createAction, props } from '@ngrx/store';
import { User } from '../reducers/user.reducers';

const SetUser = 'SetCurrentUser';
const LogoutUser = 'LogoutUser';

export const setUser = createAction(
  SetUser,
  props<User>()
);

export const logoutUser = createAction(
  LogoutUser,
)
