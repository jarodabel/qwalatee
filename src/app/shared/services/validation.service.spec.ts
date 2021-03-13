import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('Validation Service', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ValidationService] });
    service = TestBed.inject(ValidationService);

  });
});
