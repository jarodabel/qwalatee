import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BatchManagementService } from '../../shared/services/batch-management.service';
import {
  UploadObject,
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

  routeData: string;

  constructor(
    private batchManagementService: BatchManagementService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeData = this.route.snapshot.data.page;

    if (this.routeData === 'history') {
      this.pendingBatches$ = this.batchManagementService.getCompletedBatches();
    } else {
      this.pendingBatches$ = this.batchManagementService.getPendingBatches();
    }
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

  keyDescOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return a.key - b.key;
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }
}
