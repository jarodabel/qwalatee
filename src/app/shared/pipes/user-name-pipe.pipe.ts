import { Pipe, PipeTransform } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { AppState } from '../../app-state';
import { OrganizationUser } from '../reducers/statement.reducers';
import { selectUserById } from '../selectors/statements.selectors';
@Pipe({ name: 'username' })
export class UseramePipe implements PipeTransform {
  constructor(private store: Store<AppState>) {}

  private async getUser(id) {
    return await this.store
      .pipe(
        select(selectUserById(id)),
        take(1),
        map((user) => `${user.firstname} ${user.lastname}`)
      )
      .toPromise();
  }

  transform(id: string) {
    return this.getUser(id);
  }
}
