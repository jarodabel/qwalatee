import { Observable } from 'rxjs';

export class MockValidatonService {
  responseSub = new Observable();
  checkData() {}
  validate() {}
  validateHeaderRow() {}
}
