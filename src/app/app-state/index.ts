import { Statements } from '../shared/reducers/statement.reducers';
import { User } from '../shared/reducers/user.reducers';

export interface AppState {
  breadcrumbs: {};
  statements: Statements;
  user: User;
}
