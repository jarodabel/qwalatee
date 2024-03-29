import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChcAddress } from '../../types/lob';
@Injectable({
  providedIn: 'root',
})
export class LobService {
  headerRow = ['Date', 'Service', 'Charge', 'Paid', 'Due'];
  statementCodes = [];
  excessTables = [];

  cloudFnUrl = {
    default: 'https://us-central1-pdsa-oskee.cloudfunctions.net',
    dev: 'https://us-central1-pdsa-oskee-dev.cloudfunctions.net',
  }

  constructor(private http: HttpClient) {}

  sendLobRequest(env, template, user, overWriteAddress?) {
    const data = {
      color: true,
      custom_envelope: null,
      double_sided: true,
      description: 'CHCSEK Statement',
      from: ChcAddress[env],
      file: template,
      merge_variables: {
        amtDue: user.amtDue,
        firstTable: user.firstTable,
        secondTable: user.secondTable || null,
        thirdTable: user.thirdTable || null,
        fourthTable: user.fourthTable || null,
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

    if (overWriteAddress) {
      data.to = overWriteAddress;
    }

    if (user.excessTableIds) {
      user.excessTableIds.split(',').forEach((id) => {
        data.merge_variables[id] = user[id];
      });
    }

    return this.http.post(
      `${this.getCloudFnUrl()}/postLobRequest?env=${env}`,
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

  sendLetter(env, template, user, overWriteAddress?) {
    const userObj = this.makeUserForLob(user);
    this.reset();
    return this.sendLobRequest(env, template, userObj, overWriteAddress);
  }

  makeUserForLob(user) {
    let charges = [];
    let statementCodeMessage = '';
    let firstTable;
    let secondTable;
    let totalCharges = 0.0;
    let totalPayments = 0.0;
    let checkForNoBill = false;
    let claimLength = 0;
    if (user.charges.length) {
      charges = [...user.charges].map((a, i) => {
        a.splice(0, 3);
        if (a[2]) {
          totalCharges += parseFloat(a[2]);
        }
        if (a[3]) {
          totalPayments += parseFloat(a[3]);
        }

        if (a[1].includes('Claim:')) {
          checkForNoBill = true;
          claimLength = 1;

          return this.getClaimRow(a);
        } else if (a[1].includes('Your Balance')) {
          checkForNoBill = false;
          claimLength = null;

          return this.getBalanceRow(a);
        } else if (a[1].includes('****')) {
          this.personalStatementCodeGroup(a[1]);
          return;
          // return this.getPayOnlineRow(a);
        }
        // check for no bill or dummy code here
        if (checkForNoBill && !a[2] && !a[3] && !a[4]) {
          return;
        }
        claimLength += 1;
        return this.getHtmlRow(a);
      });

      statementCodeMessage =
        `<strong>` +
        this.statementCodes.join('</strong>, <strong>') +
        '</strong>';
    }

    const characterMax = 4400;
    const baseIndex = 21;
    const tableMax = 30;
    const thirdPageExtraRows = 0;

    const chargesCount = charges.length;

    // if excessive length ignore second table;
    let maxRows = [this.getHeaderRow(), ...charges.slice(0, tableMax * 2)];
    const bothTablesCharacterLength = maxRows.join('').length;
    maxRows = undefined;

    console.log(bothTablesCharacterLength)

    if (chargesCount >= baseIndex && bothTablesCharacterLength < characterMax) {
      const firstRows = [this.getHeaderRow(), ...charges.slice(0, tableMax)];
      firstTable = this.getTableWrap('firstTable', firstRows);
      const remaining = [
        ...charges.slice(tableMax, tableMax * 2 + thirdPageExtraRows),
      ];
      let rows = [];
      if (remaining.length > 0) {
        rows = [this.getHeaderRow(), ...remaining];
      }
      secondTable = this.getTableWrap('secondTable', rows);
    } else {
      const firstRows = [this.getHeaderRow(), ...charges.slice(0, baseIndex)];
      firstTable = this.getTableWrap('firstTable', firstRows);
    }

    console.log(firstTable?.length);
    console.log(secondTable?.length);

    const dateParts = user.date.split('-');
    const formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`;

    const obj: { [key: string]: any } = {
      name: `${user.first} ${user.m} ${user.last}`,
      add1: user.add1,
      add2: user.add2 || '',
      city: user.city,
      state: user.state,
      zip: user.zip,
      amtDue: user.amtDue,
      id: user.id,
      date: formattedDate,
      firstTable,
      statementCode: statementCodeMessage,
      totalPayments: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(totalPayments),
      totalCharges: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(totalCharges),
    };

    if (secondTable) {
      obj.secondTable = secondTable;
    }

    return obj;
  }

  getLetterObject(env, id) {
    return this.http.post(
      `${this.getCloudFnUrl()}/getLobRequest?env=${env}`,
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

  getCloudFnUrl() {
    return environment.production === 'true' ? this.cloudFnUrl.default : this.cloudFnUrl.dev;
  }

  private personalStatementCodeGroup(row) {
    const rowParts = row.split('-');
    const code = rowParts[1].replace('****', '').trim();
    this.statementCodes.push(code);
  }

  private getHtmlRow(data) {
    let res = '<tr>';
    res += data.map((item) => `<td>${item}</td>`).join('');
    res += '</tr>';
    return res;
  }

  private getClaimRow(data) {
    let res = '<tr>';
    res += data
      .map((_item) => {
        let item = _item;
        if (item.includes('Claim:')) {
          item = item.replace(':', ': ');
        }
        return `<td><strong><u>${item}</u></strong></td>`;
      })
      .join('');
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
    return res;
  }

  private getTableWrap(className, data) {
    return `<table style="border-collapse:collapse" class="${className} charges-table font-12" align="right">${data.join(
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

  private blankSpacerRow() {
    return '<tr><td colspan="5" style="height: 10px"></td></tr>';
  }

  private getPayOnlineRow(row) {
    const message = row[1].replaceAll('****', '');
    return (
      `<tr><td colspan="5"><strong>${message}</strong></td></tr>` +
      this.blankSpacerRow()
    );
  }

  private reset() {
    this.statementCodes.length = 0;
    this.excessTables.length = 0;
  }
}
