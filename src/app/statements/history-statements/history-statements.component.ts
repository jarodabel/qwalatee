import { Component, NgModule } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { LobService } from '../../shared/services/lob.service';
import { StatementService } from '../../shared/services/statement.service';

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

  constructor(
    private statementService: StatementService,
    private lobService: LobService
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
  }

  async getLetterObj(row) {
    const res: any = await this.lobService
      .getLetterObject(row.ltrId)
      .pipe(take(1))
      .toPromise();
    row.url = res.url;
  }

  openLetter(url){
    window.open(url, '_blank');
  }
}

@NgModule({
  declarations: [HistoryStatementsComponent],
  exports: [],
})
export class HistoryStatementsModule {}
