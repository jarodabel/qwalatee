import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { AppState } from '../app-state';
import { setAllUsers } from '../shared/actions/statement.actions';
import { UploadEventPipe } from '../shared/pipes/upload-event.pipe';
import { UseramePipe } from '../shared/pipes/user-name-pipe.pipe';
import { UserService } from '../shared/services/user.service';
import { SharedModule } from '../shared/shared.module';
import { BatchReviewComponent } from './batch-review/batch-review.component';
import { BatchUploadComponent } from './batch-upload/batch-upload.component';

import { BatchReviewDetailsComponent } from './batch-review/batch-review-details/batch-review-details.component';
import { ReviewPdfComponent } from './batch-review/review-pdf/review-pdf.component';
import { BatchExploreComponent } from './batch-explore/batch-explore.component';
import { BatchSharedComponent } from './batch-shared/batch-shared.component';
import { selectCurrentUserHasLobPermission, selectUser } from '../shared/selectors/user.selectors';
import { Router } from '@angular/router';
import { RoutePermissionMap } from './statements.types';

export enum TabNames {
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
  user$ = this.store.pipe(select(selectUser));

  hasUploadPermission$ = this.store.pipe(select(selectCurrentUserHasLobPermission(RoutePermissionMap['upload-batch'] )));
  hasExplorePermission$ = this.store.pipe(select(selectCurrentUserHasLobPermission(RoutePermissionMap['explore-batch'])));
  hasReviewPermission$ = this.store.pipe(select(selectCurrentUserHasLobPermission(RoutePermissionMap['review-batch'])));
  hasHistoryPermission$ = this.store.pipe(select(selectCurrentUserHasLobPermission(RoutePermissionMap['review-history'])));

  constructor(
    private userService: UserService,
    private store: Store<AppState>,
    private router: Router
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
    UploadEventPipe,
    UseramePipe,
    BatchReviewDetailsComponent,
    ReviewPdfComponent,
    BatchExploreComponent,
    BatchSharedComponent,
  ],
  exports: [UploadEventPipe, UseramePipe],
  imports: [CommonModule, SharedModule, BrowserModule, FormsModule],
})
export class StatementsModule {}
