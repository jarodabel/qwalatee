import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { StatementSearchComponent } from './statement-search.component';
import firebase from 'firebase';
import { firestore } from '../../shared/services/firebase.mock';
import { SearchService } from '../../shared/services/search.service';
import { SearchServiceMock } from '../../shared/services/search.service.mock';

jest.mock('firebase');

describe('StatementSearchComponent', () => {
  let component: StatementSearchComponent;
  let fixture: ComponentFixture<StatementSearchComponent>;

  beforeAll(() => {
    firebase.firestore = firestore as any;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatementSearchComponent ],
      imports: [
        FormsModule,
      ],
      providers: [
        {provide: SearchService, useClass: SearchServiceMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
