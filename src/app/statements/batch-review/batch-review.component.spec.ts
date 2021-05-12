import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchReviewComponent } from './batch-review.component';

describe('BatchReviewComponent', () => {
  let component: BatchReviewComponent;
  let fixture: ComponentFixture<BatchReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
