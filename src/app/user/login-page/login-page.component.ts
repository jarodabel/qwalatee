import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app-state';
import { resetBreadcrumb } from 'src/app/shared/actions/shared-actions';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  constructor(public afAuth: AngularFireAuth, private store: Store<AppState>) {}
  ngOnInit() {
    this.store.dispatch(resetBreadcrumb());
  }
}
