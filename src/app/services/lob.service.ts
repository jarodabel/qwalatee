import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Lob from 'Lob';
import { TemplateLookup } from '../types/lob';
import * as envData from '../../../credentials.json';

const baseConfig = {};

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
        name: user.first_name,
        total_charges: user.totalCharges,
      },
      perforated_page: 1,
      return_envelope: true,
      to: {
        name: user.name,
        address_line1: user.address1,
        address_line2: user.address2,
        address_city: user.city,
        address_state: user.state,
        address_zip: user.zip,
      },
    };
    console.log('a', data);
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${envData.lob['public-test']}:`),
      }),
    };

    return this.http.post(this.url, data, options);
  }

  sendLetter(template, user) {
    const userObj = this.makeUser(user);
    return this.sendLobRequest(template, userObj);
  }

  makeUser(user) {
    return {
      name: `${user.first_name} ${user.last_name}`,
      address1: user.address,
      address2: user.addressAdditional || '',
      city: user.city,
      state: user.state,
      zip: user.zip,
      totalCharges: '$ 999.79',
    };
  }
}
