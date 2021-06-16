import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import firebase from 'firebase/app';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
})
export class LogInComponent implements OnInit, AfterViewInit {
  showForm = false;
  errorMessage = false;
  loginForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngAfterViewInit() {}

  emailPasswordForm() {
    this.showForm = true;
  }

  onSubmit() {
    this.logInWithEmail(
      this.loginForm.get('email').value,
      this.loginForm.get('password').value
    );
  }

  logInWithEmail(email, password) {
    const success = this.success.bind(this);
    const error = this.error.bind(this);
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(success)
      .catch(error);
  }

  logInWithGoogle() {
    const success = this.success.bind(this);
    const error = this.error.bind(this);
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    firebase.auth().signInWithPopup(provider).then(success).catch(error);
  }

  private success() {
    this.router.navigate(['/']);
  }

  private error(err) {
    this.showForm = false;
    this.errorMessage = true;
    console.error(err);
  }
}
