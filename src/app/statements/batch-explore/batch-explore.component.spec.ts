import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { BatchExploreComponent } from './batch-explore.component';
import firebase from 'firebase';
import { firestore } from '../../shared/services/firebase.mock';
import { UserService } from '../../shared/services/user.service';
import { UserServiceMock } from '../../shared/services/user.service.mock';
import { StatementService } from '../../shared/services/statement.service';
import { StatementServiceMock } from '../../shared/services/statement.service.mock';
import { LobService } from '../../shared/services/lob.service';
import { MockLobService } from '../../shared/services/lob.service.mock';
import { BatchManagementService } from '../../shared/services/batch-management.service';
import { BatchManagementServiceMock } from '../../shared/services/batch-management.service.mock';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

jest.mock('firebase');

@Component({
  template: ``,
})
export class BlankCmp {}

describe('BatchExploreComponent', () => {
  let component: BatchExploreComponent;
  let fixture: ComponentFixture<BatchExploreComponent>;

  beforeAll(() => {
    firebase.firestore = firestore as any;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchExploreComponent, BlankCmp],
      imports: [
        RouterTestingModule.withRoutes([{ path: '', component: BlankCmp }]),
      ],
      providers: [
        provideMockStore({}),
        { provide: UserService, useClass: UserServiceMock },
        { provide: StatementService, useClass: StatementServiceMock },
        { provide: LobService, useClass: MockLobService },
        {
          provide: BatchManagementService,
          useClass: BatchManagementServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            parent: {
              params: of({})
            },
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
