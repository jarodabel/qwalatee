import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChcAddress } from '../../types/lob';
@Injectable({
  providedIn: 'root',
})
export class LobService {
  headerRow = ['Date', 'Service', 'Charge', 'Paid', 'Due'];
  statementCodes = [];
  excessTables = [];

  cloudFnUrl = 'https://us-central1-pdsa-oskee.cloudfunctions.net';
  constructor(private http: HttpClient) {}

  sendLobRequest(env, template, user) {
    const data = {
      color: true,
      custom_envelope: null,
      double_sided: true,
      description: 'CHCSEK Statement',
      from: ChcAddress[env],
      file: template,
      merge_variables: {
        amtDue: user.amtDue,
        charges: user.charges,
        excessTableIds: user.excessTableIds || null,
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

    if (user.excessTableIds) {
      user.excessTableIds.split(',').forEach((id) => {
        data.merge_variables[id] = user[id];
      });
    }

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
    this.reset();
    return this.sendLobRequest(env, template, userObj);
  }

  makeUserForLob(user) {
    let charges = [];
    let statementCodeMessage = '';
    let firstTable;
    let totalCharges = 0.0;
    let totalPayments = 0.0;
    if (user.charges.length) {
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
        } else if (a[1].includes('****')) {
          this.personalStatementCodeGroup(a[1]);
          return this.getPayOnlineRow(a);
        }
        return this.getHtmlRow(a);
      });

      statementCodeMessage =
        `<strong>` +
        this.statementCodes.join('</strong>, <strong>') +
        '</strong>';
    }
    const breakIndex = 25;
    if (charges.length >= breakIndex) {
      const firstRows = [this.getHeaderRow(), ...charges.slice(0, breakIndex)];
      firstTable = this.getTableWrap('firstTable', firstRows);
      const remainingRows = [...charges.slice(breakIndex)];
      this.buildTablesForRemainingRows(remainingRows);
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

    if (this.excessTables.length) {
      const ids = [];
      this.excessTables.forEach((chunk, i) => {
        const key = `excessTable${i}`;
        obj[key] = chunk;
        ids.push(key);
      });
      obj.excessTableIds = ids.join(',');
    } else {
      obj.excessTableIds = null;
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

  private blankSpacerRow() {
    return '<tr><td colspan="5" style="height: 10px"></td></tr>';
  }

  private getPayOnlineRow(row) {
    return (
      `<tr><td colspan="5"><stron>${row[1]}</strong></td></tr>` +
      this.blankSpacerRow()
    );
  }

  private reset() {
    this.statementCodes.length = 0;
    this.excessTables.length = 0;
  }

  private buildTablesForRemainingRows(remainingRows) {
    const characterLimit = 2900;

    // chunk remaining rows based on total character length
    const tempTable = [];
    let characterCount = 0;

    const excessChunks = [];

    for (let i = 0; i < remainingRows.length; i++) {
      const row = remainingRows[i];
      const characters = row.length;
      if (characterCount + characters < characterLimit) {
        tempTable.push(row);
      } else {
        if (excessChunks.length === 0) {
          excessChunks.push([this.getHeaderRow(), ...tempTable]);
        } else {
          excessChunks.push([...tempTable]);
        }
        tempTable.length = 0;
        characterCount = 0;
        tempTable.push(row);
      }
      characterCount += characters;

      // handle last table
      if (i === remainingRows.length - 1) {
        excessChunks.push([...tempTable]);
      }
    }

    excessChunks.forEach((chunk, i) => {
      this.excessTables.push(this.getTableWrap(`excessTable${i}`, chunk));
    });
  }
}
