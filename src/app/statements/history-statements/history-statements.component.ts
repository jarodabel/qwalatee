import { Component, NgModule } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { LobService } from '../../shared/services/lob.service';
import { StatementService } from '../../shared/services/statement.service';
import { UserService } from '../../shared/services/user.service';
import { AccessType } from '../../types/access';

@Component({
  selector: 'history-statements',
  templateUrl: './history-statements.component.html',
  styleUrls: ['./history-statements.component.scss'],
})
export class HistoryStatementsComponent {
  searchTerm = '';
  loading = false;
  results = [];
  headers = ['created', 'date', 'user', 'id', 'ltrId'];
  headerTitles = ['Date Created', 'Statement Date', 'User', 'Patient Id', 'Statement Id'];
  env = 'test';

  constructor(
    private statementService: StatementService,
    private lobService: LobService,
    private userService: UserService,
  ) {}

  async getPropertyById(id) {
    if (!id) {
      return;
    }
    this.loading = true;
    this.results = [];
    this.results = await this.statementService
      .getStatementsById(id)
      .pipe(map((stmts) => stmts.docs.map((stmt) => ({ ...stmt.data() }))))
      .toPromise();
    this.userService.postAccessLog(AccessType.STATEMENTS_HISTORY_SEARCH, id);
  }

  async getLetterObj(row) {
    const res: any = await this.lobService
      .getLetterObject(this.env, row.ltrId)
      .pipe(take(1))
      .toPromise();
    row.url = res.url;
    this.userService.postAccessLog(AccessType.STATEMENTS_HISTORY_LOAD_LOB, row.id, row.ltrId);

  }

  openLetter(url, id, ltrId){
    this.userService.postAccessLog(AccessType.STATEMENTS_HISTORY_OPEN_LOB, id, ltrId);

    window.open(url, '_blank');
  }
}
