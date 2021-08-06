import { TestBed } from '@angular/core/testing';

import { LobEventsService } from './lob-events.service';

describe('LobEventsService', () => {
  let service: LobEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LobEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
