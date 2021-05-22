import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { from, Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AppState } from '../../app-state';
import { setUploads } from '../../shared/actions/statement.actions';
import { BatchManagementService } from '../../shared/services/batch-management.service';
import {
  UploadObject,
  UploadService,
} from '../../shared/services/upload.service';

export enum ModalType {
  DeleteConfirmation,
  MailConfirmation,
}

@Component({
  selector: 'app-batch-review',
  templateUrl: './batch-review.component.html',
  styleUrls: ['./batch-review.component.scss'],
})
export class BatchReviewComponent implements OnInit {
  pendingBatches$: Observable<{ [key: string]: UploadObject[] }> = of(
    {} as any
  );
  modalTypes = ModalType;
  modalType: ModalType;
  showModal = false;
  pending = false;
  env = 'Test';
  currentBatchId: string;
  filename: string;
  page: string;

  constructor(
    private batchManagementService: BatchManagementService,
  ) {}

  ngOnInit(): void {
    this.pendingBatches$ = this.batchManagementService.getPendingBatches();
  }

  sendConfirmation(batch) {
    this.modalType = ModalType.MailConfirmation;
    this.currentBatchId = batch.id;
    this.filename = batch.filename;
    this.toggleModal();
  }

  deleteConfirmation(batch) {
    this.modalType = ModalType.DeleteConfirmation;
    this.currentBatchId = batch.id;
    this.toggleModal();
  }

  delete() {
    if (!this.currentBatchId) {
      return;
    }
    this.pending = true;
    Promise.all([
      this.batchManagementService.deleteUpload(this.currentBatchId),
      this.batchManagementService.deleteStatementRecords(this.currentBatchId),
    ])
      .then((res) => {
        this.reset();
      })
      .catch((err) => {
        console.error(err);
        this.reset();
      });
  }

  reset() {
    this.currentBatchId = undefined;
    this.filename = undefined;
    this.pending = false;
    this.toggleModal();
  }

  private toggleModal() {
    this.showModal = !this.showModal;
  }
}
