import { of } from 'rxjs';

export class MockOrganizationService {
  user$ = of();
  org$ = of();

  getUsersOrganization() {
    return of();
  }
}
