import { Action, createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user-actions';

export interface User {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  organization: string;
  lobStatements: boolean;
}

const defaultState: User = {
  email: undefined,
  firstName: undefined,
  id: undefined,
  lastName: undefined,
  organization: undefined,
  lobStatements: false,
};

export enum HistoryObject {
  CREATED = 'created',
  GROUP = 'group',
  ID = 'id',
  LTRID = 'ltrId',
  STATUS = 'status',
  ENVIRONMENT = 'environment',
  USER = 'user',
}

export enum HistoryHeaders {
  CREATED = 'Created Date',
  GROUP = 'Group',
  ID = 'ID',
  LTRID = 'Letter ID',
  STATUS = 'Status',
  ENVIRONMENT = 'ENV',
  USER = 'User ID',
}

const userReducer = createReducer(
  defaultState,
  on(UserActions.setUser, (state, { type, ...rest }) => {
    return {
      ...state,
      ...rest,
    };
  })
);

export function userReducerFn(state: User | undefined, action: Action) {
  return userReducer(state, action);
}
