import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChcAddress } from '../../types/lob';
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

  cloudFnUrl = 'https://us-central1-pdsa-oskee.cloudfunctions.net';
  constructor(private http: HttpClient) {}

  sendLobRequest(env, template, user) {
    const data = {
      color: false,
      custom_envelope: null,
      double_sided: true,
      description: 'CHCSEK Statement',
      from: ChcAddress[env],
      file: template,
      merge_variables: {
        amtDue: user.amtDue,
        charges: user.charges,
        chargesExtended: user.chargesExtended,
        statement_code: user.statementCode,
        id: user.id,
        name: user.name,
        statementDate: user.date,
        totalCharges: user.totalCharges,
        totalPayments: user.totalPayments,
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

    // do post with function
    return this.http.post(
      `${this.cloudFnUrl}/postLobRequest?env=${env}`,
      {
        ...data,
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }

  sendLetter(env, template, user) {
    const userObj = this.makeUserForLob(user);
    return this.sendLobRequest(env, template, userObj);
  }

  makeUserForLob(user) {
    let charges = [];
    let lastChargeRow: string;
    let lastRowMessage = '';
    let firstTable;
    let secondTable;
    let totalCharges = 0.00;
    let totalPayments = 0.00;
    if (user.charges.length) {
      lastChargeRow = user.charges[user.charges.length - 1];
      lastRowMessage = lastChargeRow[4];
      charges = [...user.charges].map((a) => {
        a.splice(0, 3);

        if (a[2]) {
          totalCharges += parseFloat(a[2]);
        }
        if (a[3]) {
          totalPayments += parseFloat(a[3]);
        }

        if (a[1].includes('Claim:')) {
          return this.getClaimRow(a);
        } else if (a[1].includes('Your Balance')) {
          return this.getBalanceRow(a);
        }
        return this.getHtmlRow(a);
      });
      charges.splice(0, 1);
      charges.splice(charges.length - 1, 1);
      // due column
      // charges.splice(charges.length - 1, 1);
    }
    const breakIndex = 25;
    if (charges.length >= breakIndex) {
      const firstRows = [this.getHeaderRow(), ...charges.slice(0, breakIndex)];
      firstTable = this.getTableWrap('firstTable', firstRows);
      const secondRows = [this.getHeaderRow(), ...charges.slice(breakIndex)];
      secondTable = this.getTableWrap('secondTable', secondRows);
    } else {
      const firstRows = [this.getHeaderRow(), ...charges];
      firstTable = this.getTableWrap('firstTable', firstRows);
    }

    const obj: { [key: string]: any } = {
      name: `${user.first} ${user.m} ${user.last}`,
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
      totalPayments: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPayments),
      totalCharges: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCharges),
    };
    if (secondTable) {
      obj.chargesExtended = secondTable;
    }
    return obj;
  }

  getLetterObject(env, id) {
    return this.http.post(
      `${this.cloudFnUrl}/getLobRequest?env=${env}`,
      {
        id,
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }

  private getHtmlRow(data) {
    let res = '<tr>';
    res += data.map((item) => `<td>${item}</td>`).join('');
    res += '</tr>';
    return res;
  }

  private getClaimRow(data) {
    let res = '<tr>';
    res += data.map((item) => `<td><u>${item}</u></td>`).join('');
    res += '</tr>';
    return res;
  }

  private getBalanceRow(data) {
    let res = '<tr>';
    res += data
      .map((item, i, arr) => {
        if (arr.length - 1 === i) {
          return `<td><strong>${item}</strong></td>`;
        }
        return `<td>${item}</td>`;
      })
      .join('');
    res += '</tr>';
    res += '<tr><td colspan="5" style="height: 10px"></td></tr>';
    return res;
  }

  private getTableWrap(className, data) {
    return `<table style="border-collapse:collapse" class="${className} charges-table" align="right">${data.join(
      ''
    )}</table>`;
  }

  private getHeaderRow() {
    let res = '<tr style="border-bottom: solid black 2px">';
    res += [...this.headerRow]
      .map((item) => `<td><strong>${item}</strong></td>`)
      .join('');
    res += '</tr>';
    return res;
  }
}
