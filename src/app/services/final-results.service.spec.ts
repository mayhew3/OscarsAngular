import { TestBed } from '@angular/core/testing';

import { FinalResultsService } from './final-results.service';

describe('FinalResultsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FinalResultsService = TestBed.get(FinalResultsService);
    expect(service).toBeTruthy();
  });
});
