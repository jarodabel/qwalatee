import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class HistoryStatementsComponent implements OnInit {
  searchTerm = '';
  loading = false;
  results = [];
  headers = ['created', 'date', 'user', 'id', 'ltrId'];
  headerTitles = [
    'Date Created',
    'Statement Date',
    'User',
    'Patient Id',
    'Statement Id',
  ];
  env = 'test';

  constructor(
    private statementService: StatementService,
    private lobService: LobService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.checkForUploadId();
  }

  async getPropertyById(id) {
    if (!id) {
      return;
    }
    this.loading = true;
    this.results = [];
    const results = await this.statementService.getStatementsById(id);

    this.results = results.docs.map((stmt) => ({ ...stmt.data() }));

    this.userService.postAccessLog(AccessType.STATEMENTS_HISTORY_SEARCH, id);
  }

  async getLetterObj(row) {
    const res: any = await this.lobService
      .getLetterObject(this.env, row.ltrId)
      .pipe(take(1))
      .toPromise();
    row.url = res.url;
    this.userService.postAccessLog(
      AccessType.STATEMENTS_HISTORY_LOAD_LOB,
      row.id,
      row.ltrId
    );
  }

  openLetter(url, id, ltrId) {
    this.userService.postAccessLog(
      AccessType.STATEMENTS_HISTORY_OPEN_LOB,
      id,
      ltrId
    );

    window.open(url, '_blank');
  }

  private async checkForUploadId() {
    const params = await this.route.paramMap.pipe(take(1)).toPromise();
    const uploadId = params.get('uploadId');

    if (uploadId) {
      this.fetchStatementsForUploadId(uploadId);
    }
  }

  private async fetchStatementsForUploadId(id: string) {
    if (!id) {
      return;
    }
    this.loading = true;
    this.results = [];

    const results = await this.statementService.getStatementsByUploadId(
      id
    );
    this.results = results.docs.map((stmt) => ({ ...stmt.data() }));
    this.userService.postAccessLog(AccessType.STATEMENTS_HISTORY_BATCH_LOAD, id);
  }
}
