import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import {
  filter,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { AppState } from '../../../app-state';
import { selectUser } from '../../../shared/selectors/user.selectors';
import { BatchManagementService } from '../../../shared/services/batch-management.service';
import { LobService } from '../../../shared/services/lob.service';
import { UploadObject } from '../../../shared/services/upload.service';
import { AddressOverwrite, LOB_ENV, TemplateLookup } from '../../../types/lob';
import { ModalType } from '../batch-review.component';
import { ActivatedRoute, Router } from '@angular/router';
import { selectUploadObjectById } from '../../../shared/selectors/statements.selectors';
import { StatementService } from '../../../shared/services/statement.service';
import { BatchSharedComponent } from '../../batch-shared/batch-shared.component';
import { UserService } from '../../../shared/services/user.service';

export enum ReviewIdentifiers {
  one = 'one',
  two = 'two',
  three = 'three',
}

enum StepTitles {
  REVIEW_1 = 'Review 1',
  REVIEW_2 = 'Review 2',
  REVIEW_3 = 'Review 3',
  MAILING_APPROVED = 'Mailing Approved',
  MAILING_IN_PROGRESS = 'Mailing In Progress',
  MAILING_COMPLETE = 'Mailing Complete',
}

type StepObject = {
  title: string;
  id: ReviewIdentifiers;
};

enum MailOptions {
  NONE,
  SKIP_MAILING,
  MAIL_TO_CHC,
  MAIL_TO_PATIENT,
}

const defaultStep = { title: '', id: undefined };

@Component({
  selector: 'app-batch-review-details',
  templateUrl: './batch-review-details.component.html',
  styleUrls: ['./batch-review-details.component.scss'],
})
export class BatchReviewDetailsComponent
  extends BatchSharedComponent
  implements OnInit, OnDestroy {
  modalTypes = ModalType;
  pending = false;
  showLoadingTile = false;
  disableSidebar = false;
  records = [];
  uploadId: string;
  missingUploadId = false;
  filename: string;
  uploadObj: UploadObject;
  reviewList: any[] = [];
  allSteps = [];
  currentLtrId: string;
  currentStep: StepObject = defaultStep;
  userId;
  hasPermission = false;
  showEmptyMessage = false;
  skipMailing = false;
  stepTitles = StepTitles;
  mailOptions = MailOptions;
  selectedMailingOption: MailOptions;
  displayMessage: string;
  outletActive: boolean;

  user$ = this.store.pipe(select(selectUser));
  destroy$ = new Subject();

  uploadObject$ = this.routeParams$.pipe(
    switchMap(({ uploadId }) =>
      this.store.select(selectUploadObjectById(uploadId))
    )
  );

  firstChild$ = this.route?.firstChild?.params || of({});

  constructor(
    batchManagementService: BatchManagementService,
    statementService: StatementService,
    lobService: LobService,
    userService: UserService,
    store: Store<AppState>,
    route: ActivatedRoute,
    router: Router
  ) {
    super(
      batchManagementService,
      lobService,
      statementService,
      userService,
      store,
      route,
      router
    );
  }

  ngOnInit(): void {
    this.batchManagementService
      .getPendingBatches()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.routeParams$
      .pipe(withLatestFrom(this.firstChild$), takeUntil(this.destroy$))
      .subscribe(([params, child]) => {
        this.uploadId = params.uploadId;
        this.filename = '';
        if (this.uploadId) {
          this.populateRecords();
        } else {
          this.missingUploadId = true;
        }

        if (child.reviewNumber) {
          this.disableSidebar = true;
        }
      });

    this.uploadObject$
      .pipe(
        filter((object) => !!object),
        takeUntil(this.destroy$)
      )
      .subscribe((obj) => {
        this.uploadObj = obj;
        this.reviewListFn();
      });

    this.user$
      .pipe(
        tap((a) => {
          this.userId = a.id;
          this.hasPermission = a?.lobPermissions?.canMail;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onActivate() {
    this.outletActive = true;
  }

  onDeactivate() {
    this.outletActive = false;
    this.showLoadingTile = false;
    this.disableSidebar = false;
  }

  populateRecords() {
    this.batchManagementService
      .getRecordsByUploadId(this.uploadId)
      .then((snapshot) => {
        const res = [];
        snapshot.forEach((doc) => {
          res.push({ recordId: doc.id, ...doc.data(), selected: false });
        });
        this.records = res.sort((a, b) => {
          if (a.last > b.last) return 1;
          if (b.last > a.last) return -1;
          return 0;
        });
      })
      .catch((err) => {
        console.log('error', err);
        this.records = [];
      });
  }

  getRecordForReview(reviewIndex) {
    let recordId;

    if (reviewIndex === ReviewIdentifiers.one) {
      recordId = this.uploadObj.reviewStatements.one.recordId;
    } else if (reviewIndex === ReviewIdentifiers.two) {
      recordId = this.uploadObj.reviewStatements.two.recordId;
    } else if (reviewIndex === ReviewIdentifiers.three) {
      recordId = this.uploadObj.reviewStatements.three.recordId;
    }

    if (!recordId) {
      return false;
    }

    const foundRecord = this.records.find(
      (record) => record.recordId === recordId
    );

    return JSON.parse(JSON.stringify(foundRecord));
  }

  mapCharges(record) {
    return {
      ...record,
      charges: Object.keys(record.charges).map((key) => record.charges[key]),
    };
  }

  async reviewStepClicked(obj) {
    if (this.disableSidebar) {
      return;
    }
    this.currentStep = defaultStep;

    const index = obj.id;
    obj.loading = true;

    this.showLoadingTile = true;
    this.disableSidebar = true;

    const record = this.getRecordForReview(index);

    if (!record) {
      this.showLoadingTile = false;
      this.disableSidebar = false;
      return;
    }

    let res;
    let ltrId;

    const recordCopy = Object.assign({}, record);
    const recordWithCharges = this.mapCharges(recordCopy);

    if (!record.ltrId) {
      res = await this.lobService
        .sendLetter(
          this.env,
          TemplateLookup[this.env],
          recordWithCharges,
          false
        )
        .pipe(take(1))
        .toPromise();
      ltrId = res.id;
    } else {
      ltrId = record.ltrId;
    }

    if (!ltrId) {
      throw new Error('there was an error finding ltrId');
    }

    this.showLoadingTile = false;
    this.router.navigate([ReviewIdentifiers[index], ltrId], {
      relativeTo: this.route,
    });
  }

  mailStepClicked(index) {
    this.router.navigate(['statements/review-batch', this.uploadId]);
    this.setCurrentStep();
  }

  setCurrentStep() {
    this.currentStep = [...this.allSteps].find(
      (step) => !step.checked && !step.disabled
    ) || { title: '', id: '' };
  }

  areYouSure(message, env, shouldOverwriteAddress) {
    if (!this.records) {
      return;
    }
    const answer = confirm(message);
    if (answer) {
      this.mailFn(env, shouldOverwriteAddress);
    }
  }

  mailFn(env: LOB_ENV, shouldOverwriteAddress: boolean) {
    this.pending = true;
    const update = {
      reviewIsComplete: true,
      reviewApprovedBy: this.userId,
      mailHasStarted: true,
    };
    this.statementService
      .updateUploadRecord(this.uploadId, update)
      .then((res) => {})
      .catch((err) => {
        console.error(err);
      });

    this.env = env;
    this.startStatements(this.records, shouldOverwriteAddress).subscribe(
      (s) => {},
      (err) => {
        console.log('error', err);
      },
      () => {
        console.log('success', this.completedRequests - this.failedRequests);
        console.log('error', this.failedRequests);
        this.finished();
      }
    );
  }

  mailingOptionChanged(event) {
    this.selectedMailingOption = event.target.value;
  }

  startMail(option: MailOptions) {
    let message;
    if (option === MailOptions.NONE) {
      return;
    } else if (option === MailOptions.SKIP_MAILING) {
      message = `Are you sure? Confirmation will mark this batch as completed and no statements will be mailed`;
      this.areYouSure(message, LOB_ENV.TEST, false);
    } else if (option === MailOptions.MAIL_TO_CHC) {
      message = `Are you sure? Confirmation will mail ${this.records.length} statements to CHC`;
      this.areYouSure(message, LOB_ENV.LIVE, true);
    } else if (option === MailOptions.MAIL_TO_PATIENT) {
      message = `Are you sure? Confirmation will mail ${this.records.length} patient statements`;
      this.areYouSure(message, LOB_ENV.LIVE, false);
    }

    //`Are you sure? Confirmation will mail ${this.records.length} statements. THIS CANNOT BE UNDONE`
  }

  goBack() {
    this.router.navigate(['statements', 'review-batch', this.uploadId]);
  }

  reviewListFn() {
    const isChecked = (index) => {
      if (index === 0) {
        return (
          this.uploadObj?.reviewStatements &&
          this.uploadObj.reviewStatements.one?.approved
        );
      } else if (index === 1) {
        return (
          this.uploadObj?.reviewStatements &&
          this.uploadObj.reviewStatements.two?.approved
        );
      } else if (index === 2) {
        return (
          this.uploadObj?.reviewStatements &&
          this.uploadObj.reviewStatements.three?.approved
        );
      } else if (index === 3) {
        return this.uploadObj?.reviewIsComplete;
      } else if (index === 4) {
        return this.uploadObj?.mailHasStarted && this.uploadObj?.mailComplete;
      } else if (index === 5) {
        return this.uploadObj?.mailComplete;
      }
      return false;
    };
    const isDisabled = (index) => {
      if (index === 0) {
        return (
          this.uploadObj?.reviewStatements &&
          this.uploadObj.reviewStatements.one?.approved
        );
      }
      if (isChecked(index)) {
        return true;
      }
      if (index === 3) {
        const res =
          this.uploadObj?.reviewStatements.one.approved &&
          this.uploadObj?.reviewStatements.two.approved &&
          this.uploadObj?.reviewStatements.three.approved;
        return this.uploadObj ? !res : true;
      }
      return !isChecked(index - 1);
    };
    const list = [
      {
        checked: isChecked(0),
        disabled: isDisabled(0),
        id: ReviewIdentifiers.one,
        loading: false,
        title: StepTitles.REVIEW_1,
      },
      {
        checked: isChecked(1),
        disabled: isDisabled(1),
        id: ReviewIdentifiers.two,
        loading: false,
        title: StepTitles.REVIEW_2,
      },
      {
        checked: isChecked(2),
        disabled: isDisabled(2),
        id: ReviewIdentifiers.three,
        loading: false,
        title: StepTitles.REVIEW_3,
      },
      {
        checked: isChecked(3),
        disabled: isDisabled(3),
        loading: false,
        title: StepTitles.MAILING_APPROVED,
      },
      {
        disabled: isDisabled(4),
        checked: isChecked(4),
        loading: false,
        title: StepTitles.MAILING_IN_PROGRESS,
      },
      {
        checked: isChecked(5),
        disabled: isDisabled(5),
        loading: false,
        title: StepTitles.MAILING_COMPLETE,
      },
    ];

    this.reviewList = [[list[0], list[1], list[2]], list[3], list[4], list[5]];
    this.allSteps = [...list];
  }
}
