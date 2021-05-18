import { createAction, props } from '@ngrx/store';
import { UploadObject } from '../services/upload.service';

export const SetAllUsersName = 'Set All Users';
export const SetUploads = 'Set Uploads';

export const setAllUsers = createAction(
  SetAllUsersName,
  props<{users: {}[]}>(),
)
export const setUploads = createAction(
  SetUploads,
  props<{uploads: UploadObject[]}>(),
)
