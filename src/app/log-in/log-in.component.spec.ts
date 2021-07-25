import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import firebase from 'firebase/app';
import { resolve } from 'url';

import { LogInComponent } from './log-in.component';

jest.mock('firebase');

describe('LogInComponent', () => {
  let component: LogInComponent;
  let fixture: ComponentFixture<LogInComponent>;
  beforeAll(() => {
    firebase.auth = (() => ({
      signInWithEmailAndPassword: jest.fn(
        () => new Promise((res, reject) => res)
      ),
    })) as any;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogInComponent],
      imports: [ReactiveFormsModule, RouterTestingModule.withRoutes([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.showForm).toBeFalsy();
    expect(component.errorMessage).toBeFalsy();
    expect(component.loginForm.get('email').value).toBe('');
    expect(component.loginForm.get('password').value).toBe('');
  });

  it('should call login when form is submitted', () => {
    const email = 'bill@nye.com';
    const password = '12345';
    jest.spyOn(component, 'logInWithEmail');

    component.loginForm.setValue({ email, password });
    component.onSubmit();

    expect(component.logInWithEmail).toHaveBeenCalledWith(email, password);
  });
});
