import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatementsComponent, TabNames } from './statements.component';

describe('StatementComponent', () => {
  let component: StatementsComponent;
  let fixture: ComponentFixture<StatementsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StatementsComponent],
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

  it('should change clicked tab', () => {
    component.tabClicked('blue');
    expect(component.selectedTab).toBe('blue');
  });
});
