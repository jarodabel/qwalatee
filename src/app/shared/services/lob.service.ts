import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as envData from '../../../../credentials.json';

@Injectable({
  providedIn: 'root',
})
export class LobService {
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
  constructor(private http: HttpClient) {}

  sendLobRequest(template, user) {
    const data = {
      color: false,
      custom_envelope: null,
      double_sided: true,
      description: 'CHCSEK Statement',
      from: 'adr_468039d7b6ffab30',
      file: template,
      merge_variables: {
        amtDue: user.amtDue,
        charges: user.charges,
        chargesExtended: user.chargesExtended,
        statement_code: user.statementCode,
        id: user.id,
        name: user.name,
        statementDate: user.date,
      },
      perforated_page: 1,
      return_envelope: true,
      to: {
        name: user.name,
        address_line1: user.add1,
        address_line2: user.add2,
        address_city: user.city,
        address_state: user.state,
        address_zip: user.zip,
      },
    };

    const options = this.getHeaders();

    return this.http.post(this.url, data, options);
  }

  sendLetter(template, user) {
    const userObj = this.makeUserForLob(user);
    return this.sendLobRequest(template, userObj);
  }

  makeUserForLob(user) {
    let charges = [];
    let lastChargeRow: string;
    let lastRowMessage = '';
    let firstTable;
    let secondTable;
    if (user.charges.length) {
      lastChargeRow = user.charges[user.charges.length - 1];
      lastRowMessage = lastChargeRow[4];
      charges = [...user.charges].map((a) => {
        a.splice(0, 3);
        return this.getHtmlRow(a);
      });
      charges.splice(0, 1);
      charges.splice(charges.length - 1, 1);
      // due column
      // charges.splice(charges.length - 1, 1);
    }
    const breakIndex = 25;
    if (charges.length >= breakIndex) {
      const firstRows = [this.getHeaderRow(), ...charges.splice(0, breakIndex)];
      firstTable = this.getTableWrap('firstTable', firstRows);
      const secondRows = [this.getHeaderRow(), ...charges.splice(-breakIndex)];
      secondTable = this.getTableWrap('secondTable', secondRows);
    } else {
      const firstRows = [this.getHeaderRow(), ...charges];
      firstTable = this.getTableWrap('firstTable', firstRows);
    }

    const obj: { [key: string]: any } = {
      name: `${user.first} ${user.m}, ${user.last}`,
      add1: user.add1,
      add2: user.add2 || '',
      city: user.city,
      state: user.state,
      zip: user.zip,
      amtDue: user.amtDue,
      id: user.id,
      date: user.date,
      charges: firstTable,
      statementCode: lastRowMessage,
    };
    if (secondTable) {
      obj.chargesExtended = secondTable;
    }
    return obj;
  }

  getLetterObject(id) {
    const options = this.getHeaders();
    const url = `${this.url}/${id}`;
    return this.http.get(url, options);
  }

  private getHtmlRow(data, heading?) {
    let res = '<tr>';
    if (heading) {
      res += data.map((item) => `<td><strong>${item}</strong></td>`).join('');
    } else {
      res += data.map((item) => `<td>${item}</td>`).join('');
    }
    res += '</tr>';
    return res;
  }

  private getTableWrap(className, data) {
    return `<table class="${className} charges-table" align="right">${data.join(
      ''
    )}</table>`;
  }

  private getHeaderRow() {
    return this.getHtmlRow([...this.headerRow], true);
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${envData.lob['public-test']}:`),
      }),
    };
  }
}