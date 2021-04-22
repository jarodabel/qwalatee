import { createSelector } from '@ngrx/store';
import { AppState } from '../../app-state';

export const selectStatements = (state: AppState) => state.statements;

export const selectStatementsAllUsers = createSelector(
  selectStatements,
  (statements) => statements.users,
);

export const selectUserById = (id) => {
  return createSelector(
    selectStatementsAllUsers,
    (allUsers) => {
      const match = allUsers.find(user => user.id === id);
      return match;
    },
  );
}
