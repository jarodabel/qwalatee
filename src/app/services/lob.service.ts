import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Lob from 'Lob';
import { TemplateLookup } from '../types/lob';
import * as envData from '../../../credentials.json';

@Injectable({
  providedIn: 'root',
})
export class LobService {
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

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${envData.lob['public-test']}:`),
      }),
    };

    return this.http.post(this.url, data, options);
  }

  sendLetter(template, user) {
    const userObj = this.makeUserForLob(user);
    return this.sendLobRequest(template, userObj);
  }

  makeUserForLob(user) {
    return {
      name: `${user.first} ${user.m}, ${user.last}`,
      add1: user.add1,
      add2: user.add2 || '',
      city: user.city,
      state: user.state,
      zip: user.zip,
      amtDue: user.amtDue,
      id: user.id,
      date: user.date,
    };
  }
}
