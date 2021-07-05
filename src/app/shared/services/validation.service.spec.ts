import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import firebase from 'firebase/app';
import { ValidationService } from './validation.service';
import { FirebaseMock, firestore } from './firebase.mock';

jest.mock('firebase');

describe('Validation Service', () => {
  let service: ValidationService;
  let consoleErrorSpy;
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    firebase.firestore = firestore as any;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ValidationService] });
    service = TestBed.inject(ValidationService);
    consoleErrorSpy.mockClear();
  });

  describe('checkData', () => {
    it('should not call validate', () => {
      const validateSpy = jest.spyOn(service, 'validate');
      service.checkData(undefined, undefined);
      expect(validateSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should call validate with data and statementId', () => {
      const validateSpy = jest.spyOn(service, 'validate');
      service.checkData([], 'statement-837383');
      expect(validateSpy).toHaveBeenCalled();
    })
  });

  describe('validate function', () => {
    it('should emit false if missing statement in db', (done) => {
      service.responseSub.subscribe((res) => {
        expect(res).toEqual(false);
        done();
      });
      service.checkData([], 'statement-837383');
    });

    it('should set header fields if it finds some', fakeAsync(() => {
      const acceptableFields = ['field2', 'field1', 'field8'];
      jest.spyOn(service.fs as any, 'data').mockReturnValue({acceptableFields})
      service.checkData([], 'statement-837383');
      tick();
      expect(service.headerFields).toEqual(acceptableFields);
    }));
  })

  describe('validateHeaderRow', () => {
    // every row should have all the keys
    // every row should have all the values
  })
});
