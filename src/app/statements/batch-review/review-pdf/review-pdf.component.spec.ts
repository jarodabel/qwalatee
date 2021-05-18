import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPdfComponent } from './review-pdf.component';

describe('ReviewPdfComponent', () => {
  let component: ReviewPdfComponent;
  let fixture: ComponentFixture<ReviewPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewPdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
