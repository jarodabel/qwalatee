import { createReducer, on } from '@ngrx/store';
import * as StatementActions from '../actions/statement.actions';

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
}

const defaultState: Statements = {
  users: [],
}

const setAllUsersFn = (state, { type, ...rest }) => {
  return {
    ...state,
    ...rest,
  };
};

const statementReducer = createReducer(
  defaultState,
  on(StatementActions.setAllUsers, setAllUsersFn),
)

export function statementReducerFn(state: Statements, action){
  return statementReducer(state, action);
}
