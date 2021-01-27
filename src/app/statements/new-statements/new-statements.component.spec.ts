import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { LobService } from '../../shared/services/lob.service';
import { MockLobService } from '../../shared/services/lob.service.mock';
import { OrganizationService } from '../../shared/services/organization.service';
import { MockOrganizationService } from '../../shared/services/organization.service.mock';
import { ValidationService } from '../../shared/services/validation.service';
import { MockValidatonService } from '../../shared/services/validation.service.mock';
import { NewStatementsComponent } from './new-statements.component';

describe('NewStatementComponent', () => {
  let component: NewStatementsComponent;
  let fixture: ComponentFixture<NewStatementsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [NewStatementsComponent],
        providers: [
          { provide: ValidationService, useClass: MockValidatonService },
          { provide: LobService, useClass: MockLobService },
          { provide: OrganizationService, useClass: MockOrganizationService },
          HttpClient,
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
