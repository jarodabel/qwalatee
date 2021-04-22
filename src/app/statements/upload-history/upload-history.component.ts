import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { StatementService } from '../../shared/services/statement.service';

@Component({
  selector: 'upload-history',
  templateUrl: './upload-history.component.html',
  styleUrls: ['./upload-history.component.scss'],
})
export class UploadHistoryComponent implements OnInit {
  @Output()
  filenameEvent = new EventEmitter<string>();

  history = [];
  headerTitles = ['Filename', 'Date Uploaded', 'Environment', 'User'];
  headerKeys = ['filename', 'created', 'what', 'userId'];

  constructor(
    private statementService: StatementService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getHistory();
  }

  async getHistory() {
    const data = await this.statementService.getUploadHistory();
    this.history = data.docs
      .map((item) => {
        const obj = { ...item.data() };
        obj.id = item.id;
        return obj;
      })
      .sort((a, b) => b.created - a.created);
  }

  openStatementHistory(id: string) {
    this.router.navigate([`/statements/statement-history/${id}`]);
  }
}
