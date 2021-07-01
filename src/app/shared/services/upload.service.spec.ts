import { TestBed } from '@angular/core/testing';
import firebase from 'firebase/app';
import { environment } from '../../../environments/environment';
import { firestore } from './firebase.mock';

import { UploadService, ValidationErrorTypes } from './upload.service';
import { UserService } from './user.service';

const fs = require('fs');
const path = require('path');
jest.mock('firebase');

describe('UploadServiceService', () => {
  let service: UploadService;
  let rawData;

  const filename = 'ecwTestData.txt';
  beforeAll((done) => {
    const file = path.join(__dirname, '../../../../', filename);
    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
      if (!err) {
        rawData = data;
        done();
      } else {
        console.log(err);
        fail('missing test data');
      }
    });
    firebase.initializeApp(environment.firebase);
    firebase.firestore = firestore as any;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: UserService, useValue: jest.fn() }],
    });
    service = TestBed.inject(UploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateInput', () => {
    // filename
    it('catch error for missing filename', () => {
      expect(() => {
        service.validateInput(undefined, undefined);
      }).toThrow(ValidationErrorTypes.Filename_MissingFilenameOrData);
      expect(() => {
        service.validateInput('something', undefined);
      }).toThrow(ValidationErrorTypes.Filename_MissingFilenameOrData);
      expect(() => {
        service.validateInput(undefined, 'something');
      }).toThrow(ValidationErrorTypes.Filename_MissingFilenameOrData);
    });
    it('should catch error for bad filenames', () => {
      expect(() => {
        service.validateInput('filename', 'some fake data here');
      }).toThrow(ValidationErrorTypes.Filename_MissingFilenameExtension);
    });
    it('should catch bad extensions', () => {
      expect(() => {
        service.validateInput('filename.jpeg', 'some fake data here');
      }).toThrow(ValidationErrorTypes.Filename_InvalidFileExtension);
    });

    // data
    it('should use expected delimiter', () => {
      expect(() => {
        service.validateInput('filename.txt', 'missing that delimiter');
      }).toThrow(ValidationErrorTypes.RawData_MissingDelimiter);
    });
    it('should have many rows (more than one)', () => {
      expect(() => {
        service.validateInput(
          'filename.txt',
          'missing that delimiter ecwPtStatement'
        );
      }).toThrow(ValidationErrorTypes.RawData_NotEnoughData);
    });
  });

  describe('should work with real data', () => {
    let res;
    beforeEach(() => {
      res = service.parseUpload(rawData);
    });
    it('should return data as expected', () => {
      expect(res.length).toBe(46);
      expect(res[0]).toEqual(johnDoe);
    });
    it('should create properly shaped object', () => {
      const uploadObject = service.createUploadObject(filename, res);
      expect(uploadObject.count).toBe(46);
      expect(uploadObject.filename).toBe(filename);
      expect(uploadObject.dateCreated).toBeDefined();
      // expect(uploadObject.records[0]).toEqual(johnDoe);
      expect(uploadObject.mailComplete).toBe(false);
    });
  });

  describe('do upload and verify', () => {
    let res;
    beforeEach(() => {
      res = service.parseUpload(rawData);
    });
    it('should do an upload and return success', (done) => {
      service.uploadToDb(filename, res).then((response) => {
        expect(response).toBe('');
        done();
      });
    });
  });
});

const johnDoe = {
  first: 'John',
  m: 'B',
  last: 'Doe',
  date: '2021-03-01',
  id: '54321',
  amtDue: '96.08',
  firstGuar: 'John',
  mGuar: 'B',
  lastGuar: 'Doe',
  add1: '4035 Peachtree St',
  add2: '',
  city: 'San Francisco',
  state: 'CA',
  zip: '87954',
  fac: 'The Company',
  facAdd1: 'PO BOX 1234',
  facAdd2: '',
  facCity: 'San Francisco',
  facState: 'CA',
  facZip: '87954',
  company: 'Important Name here',
  unknown1: '',
  unknown2: '',
  unknown3: '15.00',
  unknown4: '81.08',
  unknown5: '0.00',
  unknown6: '0.00',
  unknown7: '0.00',
  billNum: '543-951-0000',
  charges: [
    [
      '54321',
      '13558',
      '2020-04-29',
      '2020-04-29',
      'Patient: John B Doe, Account Num: 54321',
      '',
      '',
      '',
    ],
    [
      '54321',
      '13558',
      '2020-04-29',
      '2020-04-29',
      'Claim:1355428, Provider: Samuel Brennan, APRN',
      '',
      '',
      '',
    ],
    [
      '54321',
      '13558',
      '2020-04-29',
      '2020-04-29',
      '99422 eVIS 11-20 minutes ',
      '71.00',
      '',
      '',
    ],
    [
      '54321',
      '13558',
      '2020-04-29',
      '2020-04-29',
      'EC109 Billing Notes on claim ',
      '',
      '',
      '',
    ],
    [
      '54321',
      '13558',
      '2020-04-29',
      '2021-01-25',
      'Sliding fee schedule',
      '',
      '56.00',
      '',
    ],
    [
      '54321',
      '13558',
      '2020-04-29',
      '2021-01-25',
      'Your Balance Due On These Services ...',
      '',
      '',
      '15.00',
    ],
    [
      '54321',
      '17685',
      '2020-12-14',
      '2020-12-14',
      'Claim:1327685, Provider: Dog Oskee, APRN',
      '',
      '',
      '',
    ],
    [
      '54321',
      '17685',
      '2020-12-14',
      '2020-12-14',
      '99213 Office Visit, Est Pt., Level 3 ',
      '98.00',
      '',
      '',
    ],
    [
      '54321',
      '17685',
      '2020-12-14',
      '2021-01-07',
      'UNITED HEALTHCARE Payment',
      '',
      '0.00',
      '',
    ],
    [
      '54321',
      '17685',
      '2020-12-14',
      '2021-01-07',
      'UNITED HEALTHCARE Adjustment',
      '',
      '16.92',
      '',
    ],
    [
      '54321',
      '17685',
      '2020-12-14',
      '2021-01-07',
      'Your Balance Due On These Services ...',
      '',
      '',
      '81.08',
    ],
    [
      '54321',
      '0',
      '2021-03-01',
      '2021-03-01',
      '**** Make a secure online payment at https://healowpay.com by using your personal statement code - tttttt ****',
      '',
      '',
      '',
    ],
  ],
};
