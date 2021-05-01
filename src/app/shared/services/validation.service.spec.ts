import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { last } from 'rxjs/operators';
import { FirebaseMock } from './firebase.mock';
import { ValidationService } from './validation.service';

describe('Validation Service', () => {
  let service: ValidationService;
  let db: FirebaseMock;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ValidationService] });
    service = TestBed.inject(ValidationService);
    service.fs = new FirebaseMock() as any;
  });

  describe('checkData', () => {
    it('should not call validate', () => {
      const validateSpy = spyOn(service, 'validate');
      service.checkData(undefined, undefined);
      expect(validateSpy).not.toHaveBeenCalled();
    });

    it('should call validate with data and statementId', () => {
      const validateSpy = spyOn(service, 'validate');
      spyOn(db, 'data').and.returnValue(undefined);
      service.checkData([], 'statement-837383');
      expect(validateSpy).toHaveBeenCalled();
    })
  });

  describe('validate function', () => {
    it('should emit false if missing statement in db', (done) => {
      spyOn(db, 'data').and.returnValue(undefined);

      service.responseSub.subscribe((res) => {
        expect(res).toEqual(false);
        done();
      });
      service.checkData([], 'statement-837383');
    });

    it('should set header fields if it finds some', fakeAsync(() => {
      const acceptableFields = ['field2', 'field1', 'field8'];
      db.setData({acceptableFields})
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
