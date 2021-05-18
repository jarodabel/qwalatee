import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LobService } from './lob.service';

describe('lob service', () => {
  const ctx: any = {};
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LobService],
    });
    ctx.service = TestBed.inject(LobService);
  });

  it('should work', () => {
    expect(ctx.service).toBeDefined();
  });
});
