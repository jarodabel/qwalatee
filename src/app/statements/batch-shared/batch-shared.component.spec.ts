import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { BatchManagementService } from '../../shared/services/batch-management.service';
import { BatchManagementServiceMock } from '../../shared/services/batch-management.service.mock';
import { LobService } from '../../shared/services/lob.service';
import { MockLobService } from '../../shared/services/lob.service.mock';
import { StatementService } from '../../shared/services/statement.service';
import { StatementServiceMock } from '../../shared/services/statement.service.mock';
import { UserService } from '../../shared/services/user.service';
import { UserServiceMock } from '../../shared/services/user.service.mock';

import { BatchSharedComponent } from './batch-shared.component';

@Component({
  template: ``,
})
export class BlankCmp {}

describe('BatchSharedComponent', () => {
  let component: BatchSharedComponent;
  let fixture: ComponentFixture<BatchSharedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchSharedComponent, BlankCmp ],
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
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
