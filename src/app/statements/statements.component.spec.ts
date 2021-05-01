import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { provideMockStore } from '@ngrx/store/testing';
import { FirebaseMock } from '../shared/services/firebase.mock';
import { UserServiceMock } from '../shared/services/user.service.mock';
import { StatementsComponent } from './statements.component';

describe('StatementComponent', () => {
  let component: StatementsComponent;
  let fixture: ComponentFixture<StatementsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [provideMockStore, UserServiceMock],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
