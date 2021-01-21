import { createAction, props } from '@ngrx/store';

const SetUser = 'SetCurrentUser';

export const setUser = createAction(
  SetUser,
  props<{ [key: string]: string }>()
);
