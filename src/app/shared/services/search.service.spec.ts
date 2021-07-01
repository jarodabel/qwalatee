import { TestBed } from '@angular/core/testing';
import firebase from 'firebase/app';

import { environment } from '../../../environments/environment';
import { firestore } from './firebase.mock';

import { SearchService } from './search.service';


describe('SearchService', () => {
  let service: SearchService;

  beforeAll(() => {
    firebase.firestore = firestore as any;
  });

  beforeEach(() => {
    firebase.initializeApp(environment.firebase);

    TestBed.configureTestingModule({
      providers: [SearchService]
    });
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
