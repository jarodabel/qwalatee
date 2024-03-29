import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { concatMap, delay, takeUntil } from 'rxjs/operators';
import { AppState } from '../../app-state';
import { selectCurrentUserHasLobPermission } from '../../shared/selectors/user.selectors';
import {
  UploadService,
  UploadSteps,
} from '../../shared/services/upload.service';
import { RoutePermissionMap } from '../statements.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-batch-upload',
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.scss'],
})
export class BatchUploadComponent implements OnInit, OnDestroy {
  uploadPending = false;
  showUploadFlow = false;
  recordsUploaded = 0;
  filename = '';
  uploadStatus = [];
  uploadReset = new Subject();
  uploadSteps = UploadSteps;
  destroy$ = new Subject();
  hasExplorePermission$ = this.store.pipe(select(selectCurrentUserHasLobPermission(RoutePermissionMap['explore-batch'])));

  constructor(
    private uploadService: UploadService,
    private cdr: ChangeDetectorRef,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.uploadService.uploadStatus$
      .pipe(
        concatMap((x) => {
          if (x !== UploadSteps.UploadingRecord) {
            return of(x).pipe(delay(150));
          }
          return of(x).pipe(delay(50));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((message: UploadSteps) => {
        if (message === UploadSteps.UploadingRecord) {
          this.recordsUploaded += 1;
        } else {
          this.uploadStatus.push(message);
        }

        if (message === UploadSteps.Complete) {
          this.uploadPending = false;
        }
        this.cdr.detectChanges();
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  uploadData({ data, filename }) {
    this.filename = filename;
    this.uploadStatus.length = 0;
    this.showUploadFlow = true;
    this.uploadPending = true;
    try {
      this.uploadService.upload(filename, data);
    } catch (err) {
      console.log(err);
    }
  }

  reset() {
    this.filename = '';
    this.uploadStatus.length = 0;
    this.recordsUploaded = 0;
    this.uploadPending = false;
    this.showUploadFlow = false;
    this.uploadReset.next();
  }
}
