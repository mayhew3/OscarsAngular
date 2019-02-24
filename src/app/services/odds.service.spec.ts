import { TestBed } from '@angular/core/testing';

import { OddsService } from './odds.service';

describe('OddsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OddsService = TestBed.get(OddsService);
    expect(service).toBeTruthy();
  });
});
