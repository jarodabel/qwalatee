import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { LobService } from '../../shared/services/lob.service';
import { MockLobService } from '../../shared/services/lob.service.mock';
import { OrganizationService } from '../../shared/services/organization.service';
import { MockOrganizationService } from '../../shared/services/organization.service.mock';
import { StatementService } from '../../shared/services/statement.service';
import { StatementServiceMock } from '../../shared/services/statement.service.mock';
import { UserService } from '../../shared/services/user.service';
import { UserServiceMock } from '../../shared/services/user.service.mock';
import { ValidationService } from '../../shared/services/validation.service';
import { MockValidatonService } from '../../shared/services/validation.service.mock';
import { NewStatementsComponent } from './new-statements.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
const mockData = [
  {
    first: 'Jarod',
    m: 'E',
    last: 'Abel',
    date: '2021-01-06',
    id: '537402',
    amtDue: '27.00',
    firstGuar: 'Jarod',
    mGuar: 'E',
    lastGuar: 'Abel',
    add1: '804 Tanglewoods Dr.',
    add2: '',
    city: 'PITTSBURG',
    state: 'KS',
    zip: '66762-2554',
    fac: 'CHCSEK PITTSBURG FQHC',
    facAdd1: 'PO BOX 1832',
    facAdd2: '',
    facCity: 'PITTSBURG',
    facState: 'KS',
    facZip: '66762-1801',
    company: 'COMMUNITY HLTH CTR OF SE KS INC',
    unknown1: '',
    unknown2: '',
    unknown3: '0.00',
    unknown4: '35.00',
    unknown5: '0.00',
    unknown6: '0.00',
    unknown7: '0.00',
    billNum: '620-231-1960',
    charges: [
      [
        '92906',
        '1287895',
        '2020-11-16',
        '2020-11-16',
        'Patient: Kimberly K Palmer, Account Num: 92906',
        '',
        '',
        '',
      ],
      [
        '92906',
        '1287895',
        '2020-11-16',
        '2020-11-16',
        'Claim:1287895, Provider: Huerter, David, MD',
        '',
        '',
        '',
      ],
      [
        '92906',
        '1287895',
        '2020-11-16',
        '2020-11-16',
        '80307 09 PANEL (PROFILE 1)  ',
        '101.00',
        '',
        '',
      ],
      [
        '92906',
        '1287895',
        '2020-11-16',
        '2020-11-16',
        '99213 Office Visit, Est Pt., Level 3  ',
        '98.00',
        '',
        '',
      ],
      [
        '92906',
        '1287895',
        '2020-11-16',
        '2020-11-17',
        'Sliding fee schedule',
        '',
        '164.00',
        '',
      ],
      [
        '92906',
        '1287895',
        '2020-11-16',
        '2020-11-17',
        'Your Balance Due On These Services ...',
        '',
        '',
        '35.00',
      ],
      [
        '92906',
        '0',
        '2021-01-06',
        '2021-01-06',
        '**** Make a secure online payment at https://healowpay.com by using your personal statement code - YUeRffYh ****',
        '',
        '',
        '',
      ],
    ],
  },
];

describe('NewStatementComponent', () => {
  let component: NewStatementsComponent;
  let fixture: ComponentFixture<NewStatementsComponent>;
  const initialState = { loggedIn: false };
  let validationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [NewStatementsComponent],
        providers: [
          { provide: ValidationService, useClass: MockValidatonService },
          { provide: LobService, useClass: MockLobService },
          { provide: OrganizationService, useClass: MockOrganizationService },
          { provide: UserService, useClass: UserServiceMock },
          { provide: StatementService, useClass: StatementServiceMock },
          HttpClient,
          provideMockStore({ initialState }),
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    validationService = fixture.debugElement.injector.get(ValidationService);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should toggle env', () => {
    expect(component.env).toBe('Test');
    component.toggleEnv('Live');
    expect(component.env).toBe('Live');
  });

  it('should reset error message, set data, and check data on upload', () => {
    const data = [...mockData];
    const checkDataSpy = spyOn(component, 'checkData');
    component.uploadData(data);
    expect(component.errorMessage).toBe(undefined);
    expect(component.data).toEqual(data);
    expect(checkDataSpy).toHaveBeenCalled();
  });

  it('should not check data if selected statement undefined', () => {
    const spy = spyOn(validationService, 'checkData');
    expect(component.selectedStatement).toBe(undefined);
    component.checkData();
    expect(spy).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('selectStatement');
    expect(component.dataList).toBe(undefined);
  });

  it('should check data if statement defined and data available', () => {
    const spy = spyOn(validationService, 'checkData');
    component.selectedStatement = 'statementId';
    component.data = [...mockData];
    component.checkData();
    expect(spy).toHaveBeenCalled();
    expect(component.errorMessage).toBe(undefined);
  })
});
