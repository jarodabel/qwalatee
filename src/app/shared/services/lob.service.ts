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
    let secondTable;
    let thirdTable;
    let fourthTable;
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

    const baseIndex = 21;
    const tableMax = 30;
    const thirdPageExtraRows = 0;

    const chargesCount = charges.length;

    if (chargesCount >= baseIndex) {
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
      const firstRows = [this.getHeaderRow(), ...charges];
      firstTable = this.getTableWrap('firstTable', firstRows);
    }

    // second table > 51
    // if (chargesCount > baseIndex) {
    //   const rows = [
    //     this.getHeaderRow(),
    //     ...charges.slice(tableMax, tableMax * 2),
    //   ];
    //   secondTable = this.getTableWrap('secondTable', rows);
    // }

    // // third table
    // if (chargesCount > tableMax * 2) {
    //   const rows = [
    //     this.getHeaderRow(),
    //     ...charges.slice(tableMax * 2, tableMax * 3),
    //   ];
    //   thirdTable = this.getTableWrap('thirdTable', rows);
    // }

    // // fourth table
    // if (chargesCount > tableMax * 3) {
    //   const rows = [
    //     this.getHeaderRow(),
    //     ...charges.slice(tableMax * 3, tableMax * 4),
    //   ];
    //   fourthTable = this.getTableWrap('fourthTable', rows);
    // }

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
    if (thirdTable) {
      obj.thirdTable = thirdTable;
    }
    if (fourthTable) {
      obj.fourthTable = fourthTable;
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
