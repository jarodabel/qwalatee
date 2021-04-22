import { createAction, props } from '@ngrx/store';

export const SetAllUsersName = 'Set All Users';

export const setAllUsers = createAction(
  SetAllUsersName,
  props<{users: {}[]}>(),
)
