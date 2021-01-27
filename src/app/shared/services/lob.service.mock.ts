import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as envData from '../../../../credentials.json';

export class MockLobService {
  headerRow = [
    // 'Claim #',
    // 'Date',
    'Date',
    'Service',
    'Charge',
    'Payment',
    'Due',
  ];
  url = 'https://api.lob.com/v1/letters';

  sendLobRequest(template, user) {}

  sendLetter(template, user) {}

  makeUserForLob(user) {}

  getLetterObject(id) {}

  private getHtmlRow(data, heading?) {}

  private getTableWrap(className, data) {}

  private getHeaderRow() {}

  private getHeaders() {}
}
