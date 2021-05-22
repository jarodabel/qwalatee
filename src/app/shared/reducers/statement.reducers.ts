import { createReducer, on } from '@ngrx/store';
import * as StatementActions from '../actions/statement.actions';
import { UploadObject } from '../services/upload.service';

export type OrganizationUser = {
  email: string,
  firstname: string,
  id: string,
  lastname: string,
  lob_statements: boolean,
  organization: string,
}

export interface Statements {
  users: OrganizationUser[];
  uploads: UploadObject[];
}

const defaultState: Statements = {
  users: [],
  uploads: [],
}

const setAllUsersFn = (state, { type, ...rest }) => {
  return {
    ...state,
    ...rest,
  };
};

const setUploadsFn = (state, { type, ...rest }) => {
  return {
    ...state,
    ...rest,
  }
}

// const updateReviewRecordFn ()

const statementReducer = createReducer(
  defaultState,
  on(StatementActions.setAllUsers, setAllUsersFn),
  on(StatementActions.setUploads, setUploadsFn)
)

export function statementReducerFn(state: Statements, action){
  return statementReducer(state, action);
}
