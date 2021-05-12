import { Component, OnInit } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
  pendingBatches$: Observable<{[key:string]:UploadObject[]}> = of({});
  modalTypes = ModalType;
  modalType: ModalType;
  showModal = false;
  pending = false;
  env = 'Test';
  currentBatchId: string;

  constructor(private uploadService: UploadService, private batchManagementService: BatchManagementService) {}

  ngOnInit(): void {
    this.pendingBatches$ = from(this.batchManagementService.getPendingBatches()).pipe(
      map((snapshot) => {
        const res = [];
        snapshot.forEach((doc) => {
          res.push({ id: doc.id, ...doc.data() });
        });
        return res as UploadObject[];
      }),
      map((uploads) => {
        const res = uploads.reduce((acc, cur) => {
          const date = new Date(cur.dateCreated.seconds * 1000);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          if(!acc[key]){
            acc[key] = [];
          }
          acc[key].push(cur);
          return acc;
        }, {});
        return res;
      }),
    );
  }

  sendConfirmation(batch) {
    this.modalType = ModalType.MailConfirmation;
    this.currentBatchId = batch.id;
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
    this.pending = false;
    this.toggleModal();
  }

  private toggleModal() {
    this.showModal = !this.showModal;
  }
}
