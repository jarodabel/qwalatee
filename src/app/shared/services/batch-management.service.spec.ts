import { TestBed } from '@angular/core/testing';
import firebase from 'firebase/app';
import { provideMockStore } from '@ngrx/store/testing';
import { firestore } from './firebase.mock';

import { BatchManagementService } from './batch-management.service';

jest.mock('firebase');

describe('BatchManagementService', () => {
  let service: BatchManagementService;

  const mockState: any = {
    user: {},
    statements: {},
  };

  beforeAll(() => {
    firebase.firestore = firestore as any;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore(mockState)],
    });
    service = TestBed.inject(BatchManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
