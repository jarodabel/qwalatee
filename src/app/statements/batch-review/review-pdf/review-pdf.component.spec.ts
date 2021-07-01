import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { StatementService } from '../../../shared/services/statement.service';
import { StatementServiceMock } from '../../../shared/services/statement.service.mock';

import { ReviewPdfComponent } from './review-pdf.component';

@Component({
  template: ``,
})
export class BlankCmp {}

describe('ReviewPdfComponent', () => {
  let component: ReviewPdfComponent;
  let fixture: ComponentFixture<ReviewPdfComponent>;

  const mockState = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlankCmp, ReviewPdfComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: '', component: BlankCmp },
          { path: 'simple', component: BlankCmp },
        ]),
      ],
      providers: [
        { provide: StatementService, useValue: StatementServiceMock },
        provideMockStore(mockState),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            parent: {
              params: of({})
            }
          }
        }
      ],
    }).compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPdfComponent);
    component = fixture.componentInstance;
    jest.spyOn(component, 'clearCanvas').mockImplementation(() =>{});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
