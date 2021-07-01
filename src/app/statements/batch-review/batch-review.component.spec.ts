import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { BatchReviewComponent } from './batch-review.component';
@Component({
  template: ``,
})
export class BlankCmp {}

const mockState: any = {
  user: {},
  statements: {},
};

describe('BatchReviewComponent', () => {
  let component: BatchReviewComponent;
  let fixture: ComponentFixture<BatchReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchReviewComponent, BlankCmp],
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: BlankCmp },
          { path: 'simple', component: BlankCmp },
        ]),
        provideMockStore(),
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
});
