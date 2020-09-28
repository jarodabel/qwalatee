import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  constructor(private http: HttpClient) {}

  sendMessage(messageBody) {
    return this.http
      .post(
        `https://us-central1-pdsa-oskee.cloudfunctions.net/sendEmail?sg_key=${environment.sendGrid}`,
        {
          to: 'arodjabel@gmail.com',
          from: 'arodjabel@gmail.com',
          subject: `Qwalatee - Message from ${messageBody.name} / ${messageBody.from}`,
          text: messageBody.text,
        },
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
  }
}
