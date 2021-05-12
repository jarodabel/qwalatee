import { TestBed } from '@angular/core/testing';

import { BatchManagementService } from './batch-management.service';

describe('BatchManagementService', () => {
  let service: BatchManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
