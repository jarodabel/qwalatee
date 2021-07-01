import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { UserService } from '../shared/services/user.service';
import { UserServiceMock } from '../shared/services/user.service.mock';
import { StatementsComponent } from './statements.component';

@Component({
  template: ``,
})
export class BlankCmp {}

describe('StatementComponent', () => {
  let component: StatementsComponent;
  let fixture: ComponentFixture<StatementsComponent>;

  const mockState: any = {
    user: {},
    statements: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatementsComponent, BlankCmp],
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: BlankCmp },
          { path: 'simple', component: BlankCmp },
        ]),
      ],
      providers: [
        provideMockStore(mockState),
        { provide: UserService, useClass: UserServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
