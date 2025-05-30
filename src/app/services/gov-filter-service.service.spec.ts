import { TestBed } from '@angular/core/testing';

import { GovFilterServiceService } from './gov-filter-service.service';

describe('GovFilterServiceService', () => {
  let service: GovFilterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GovFilterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
