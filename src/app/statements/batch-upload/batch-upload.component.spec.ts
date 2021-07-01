import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../shared/services/user.service';
import { UserServiceMock } from '../../shared/services/user.service.mock';
import { UploadCSVComponent } from '../../shared/upload-csv/upload-csv.component';
import { BatchUploadComponent } from './batch-upload.component';

import firebase from 'firebase';
import { firestore } from '../../shared/services/firebase.mock';
import { StatementService } from '../../shared/services/statement.service';
import { StatementServiceMock } from '../../shared/services/statement.service.mock';
import { UploadService } from '../../shared/services/upload.service';
import { UploadServiceMock } from '../../shared/services/upload.service.mock';
import { provideMockStore } from '@ngrx/store/testing';

jest.mock('firebase');

@Component({
  template: ``,
})
export class BlankCmp {}
describe('BatchUploadComponent', () => {
  let component: BatchUploadComponent;
  let fixture: ComponentFixture<BatchUploadComponent>;

  beforeAll(() => {
    firebase.firestore = firestore as any;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchUploadComponent, UploadCSVComponent, BlankCmp],
      imports: [
        RouterTestingModule.withRoutes([{ path: '', component: BlankCmp }]),
      ],
      providers: [
        { provide: UserService, useClass: UserServiceMock },
        { provide: StatementService, useClass: StatementServiceMock },
        { provide: UploadService, useClass: UploadServiceMock},
        provideMockStore({}),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
