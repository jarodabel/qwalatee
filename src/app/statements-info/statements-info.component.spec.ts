import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementsInfoComponent } from './statements-info.component';

describe('StatementsInfoComponent', () => {
  let component: StatementsInfoComponent;
  let fixture: ComponentFixture<StatementsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatementsInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
