import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { BatchManagementService } from '../../shared/services/batch-management.service';
import { BatchManagementServiceMock } from '../../shared/services/batch-management.service.mock';

import { BatchReviewComponent, ModalType } from './batch-review.component';
@Component({
  template: ``,
})
export class BlankCmp {}

describe('BatchReviewComponent', () => {
  let component: BatchReviewComponent;
  let fixture: ComponentFixture<BatchReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchReviewComponent, BlankCmp],
      imports: [
        RouterTestingModule.withRoutes([{ path: '', component: BlankCmp }]),
      ],
      providers: [
        provideMockStore({}),
        {
          provide: BatchManagementService,
          useClass: BatchManagementServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            parent: {
              params: of({}),
            },
            snapshot: {
              data: {
                page: '',
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open delete confirmation model on delete button press', () => {
    expect(component.modalType).toBeUndefined();
    expect(component.currentBatchId).toBeUndefined();
    expect(component.showModal).toBe(false);

    component.deleteConfirmation({ id: 'dog' });
    expect(component.modalType).toBe(ModalType.DeleteConfirmation);
    expect(component.currentBatchId).toBe('dog');
    expect(component.showModal).toBe(true);
  });
});
