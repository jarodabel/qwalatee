import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchReviewDetailsComponent } from './batch-review-details.component';

describe('BatchReviewDetailsComponent', () => {
  let component: BatchReviewDetailsComponent;
  let fixture: ComponentFixture<BatchReviewDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchReviewDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchReviewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
