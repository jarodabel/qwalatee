import { of } from 'rxjs';

export class BatchManagementServiceMock {
  getPendingBatches() {
    return of()
  }
  getCompletedBatches() {}
  deleteUpload() {}
  deleteStatementRecords() {}
  deleteStatementCharges() {}
  getRecordsByUploadId() {}
  getCharges() {}
  setRecordAsTestView() {}
  mapCharges() {}
}
