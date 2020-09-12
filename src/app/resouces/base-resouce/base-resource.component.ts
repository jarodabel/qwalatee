import {
  Component,
  NgModule,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import * as envData from '../../../../credentials.json';
import { BrowserModule } from '@angular/platform-browser';
import { ResourcePipe } from '../../shared/pipes/resouce-pipe.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'base-resources',
  templateUrl: 'base-resource.component.html',
  styleUrls: ['base-resource.component.scss'],
})
export class BaseResourceComponent implements AfterViewInit {
  title = 'chc-resource';
  // Client ID and API key from the Developer Console
  CLIENT_ID = envData.web.client_id;
  API_KEY = envData.web.api_key;

  // Array of API discovery doc URLs for APIs used by the quickstart
  DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

  header = [];
  body = [];
  searchTerm = '';
  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // this.checkParams();
    window.gapi.load('client:auth2', this.initClient.bind(this));
  }

  initClient() {
    window.gapi.client
      .init({
        apiKey: this.API_KEY,
        clientId: this.CLIENT_ID,
        discoveryDocs: this.DISCOVERY_DOCS,
        scope: this.SCOPES,
      })
      .then(this.loadSheet.bind(this));
  }

  loadSheet() {
    window.gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: '1FcToV8Iz1A0Dsmjf795qaEUgKhzu8e3CV0TxKvanO7c',
        range: 'chc',
      })
      .then(this.parseData.bind(this));
  }

  parseData(response) {
    const result = response.result;
    const [first, ...rest] = result.values;
    this.header = first;
    this.body = rest;
    this.cdr.detectChanges();
  }
}

@NgModule({
  declarations: [BaseResourceComponent, ResourcePipe],
  exports: [ResourcePipe],
  imports: [BrowserModule, CommonModule, FormsModule],
})
export class ResourcesModule {}
