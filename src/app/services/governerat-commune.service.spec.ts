import { TestBed } from '@angular/core/testing';

import { GoverneratCommuneService } from './governerat-commune.service';

describe('GoverneratCommuneService', () => {
  let service: GoverneratCommuneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoverneratCommuneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
