import { Action, createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user-actions';

export interface User {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  organization: string;
  lobPermissions: {
    admin: boolean;
    canMail: boolean;
    statements: boolean;
    explore:boolean;
    history: boolean;
    review: boolean;
    uploads: boolean
  }
}

const defaultState: User = {
  email: undefined,
  firstName: undefined,
  id: undefined,
  lastName: undefined,
  organization: undefined,
  lobPermissions: {
    admin: false,
    canMail: false,
    explore: false,
    history: false,
    statements: false,
    review: false,
    uploads: false,
  }
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

const setUserReducerFn = (state, { type, ...rest }) => {
  return {
    ...state,
    ...rest,
  };
};

const logoutUserReducerFn = (state, { type, ...rest }) => {
  return {
    ...defaultState,
  }
}

const userReducer = createReducer(
  defaultState,
  on(UserActions.setUser, setUserReducerFn),
  on(UserActions.logoutUser, logoutUserReducerFn),
);

export function userReducerFn(state: User | undefined, action: Action) {
  return userReducer(state, action);
}
