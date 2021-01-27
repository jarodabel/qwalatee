import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';
import { HistoryStatementsComponent } from './history-statements/history-statements.component';

import { NewStatementsComponent } from './new-statements/new-statements.component';

export enum TabNames {
  NewStatements = 'newStatements',
  HistoryStatements = 'historyStatements',
}

@Component({
  selector: 'statements',
  templateUrl: './statements.component.html',
  styleUrls: ['statements.component.scss'],
})
export class StatementsComponent {
  tabNames = TabNames;
  selectedTab = TabNames.NewStatements;
  tabClicked(clicked) {
    this.selectedTab = clicked;
  }
}

@NgModule({
  declarations: [
    StatementsComponent,
    NewStatementsComponent,
    HistoryStatementsComponent,
  ],
  exports: [],
  imports: [CommonModule, SharedModule, BrowserModule, FormsModule],
})
export class StatementsModule {}
