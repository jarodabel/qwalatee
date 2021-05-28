import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchSharedComponent } from './batch-shared.component';

describe('BatchSharedComponent', () => {
  let component: BatchSharedComponent;
  let fixture: ComponentFixture<BatchSharedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchSharedComponent ]
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
