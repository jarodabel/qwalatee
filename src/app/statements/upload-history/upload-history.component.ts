import { Component, OnInit } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StatementService } from '../../shared/services/statement.service';

@Component({
  selector: 'upload-history',
  templateUrl: './upload-history.component.html',
  styleUrls: [],
})
export class UploadHistoryComponent implements OnInit {
  history: any;
  constructor(private statementService: StatementService) { }
  ngOnInit() {
    this.getHistory();
  }

  async getHistory(){
    this.history = await this.statementService.getUploadHistory();
    console.log(this.history.docs)
  }
}
