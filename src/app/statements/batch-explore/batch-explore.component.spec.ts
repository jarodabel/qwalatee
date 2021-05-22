import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchExploreComponent } from './batch-explore.component';

describe('BatchExploreComponent', () => {
  let component: BatchExploreComponent;
  let fixture: ComponentFixture<BatchExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchExploreComponent ]
    })
    .compileComponents();
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
