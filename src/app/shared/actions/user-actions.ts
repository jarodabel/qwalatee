import { createAction, props } from '@ngrx/store';

const SetUser = 'SetCurrentUser';
const LogoutUser = 'LogoutUser';

export const setUser = createAction(
  SetUser,
  props<{ [key: string]: string }>()
);

export const logoutUser = createAction(
  LogoutUser,
)
