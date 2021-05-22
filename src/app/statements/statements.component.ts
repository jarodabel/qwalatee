import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { AppState } from '../app-state';
import { setAllUsers } from '../shared/actions/statement.actions';
import { UploadEventPipe } from '../shared/pipes/upload-event.pipe';
import { UseramePipe } from '../shared/pipes/user-name-pipe.pipe';
import { UserService } from '../shared/services/user.service';
import { SharedModule } from '../shared/shared.module';
import { BatchReviewComponent } from './batch-review/batch-review.component';
import { BatchUploadComponent } from './batch-upload/batch-upload.component';
import { HistoryStatementsComponent } from './history-statements/history-statements.component';

import { NewStatementsComponent } from './new-statements/new-statements.component';
import { UploadHistoryComponent } from './upload-history/upload-history.component';
import { SendModalComponent } from './batch-review/send-modal/send-modal.component';
import { BatchReviewDetailsComponent } from './batch-review/batch-review-details/batch-review-details.component';
import { ReviewPdfComponent } from './batch-review/review-pdf/review-pdf.component';
import { BatchExploreComponent } from './batch-explore/batch-explore.component';

export enum TabNames {
  NewStatements = 'newStatements',
  HistoryStatements = 'historyStatements',
  UploadHistory = 'uploadHistory',
  AllActivity = 'allActivity',
}

@Component({
  selector: 'statements',
  templateUrl: './statements.component.html',
  styleUrls: ['statements.component.scss'],
})
export class StatementsComponent implements OnInit {
  tabNames = TabNames;

  constructor(
    private userService: UserService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.getAllUsers();
  }

  async getAllUsers() {
    const usersQuerySnapshot = await this.userService.getAllUsers();
    const users = usersQuerySnapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
    this.store.dispatch(setAllUsers({ users }));
  }
}

@NgModule({
  declarations: [
    BatchReviewComponent,
    BatchUploadComponent,
    StatementsComponent,
    NewStatementsComponent,
    HistoryStatementsComponent,
    UploadHistoryComponent,
    UploadEventPipe,
    UseramePipe,
    SendModalComponent,
    BatchReviewDetailsComponent,
    ReviewPdfComponent,
    BatchExploreComponent
  ],
  exports: [UploadEventPipe, UseramePipe],
  imports: [CommonModule, SharedModule, BrowserModule, FormsModule],
})
export class StatementsModule {}
