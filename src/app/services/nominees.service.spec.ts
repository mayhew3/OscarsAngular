import { TestBed } from '@angular/core/testing';

import { NomineesService } from './nominees.service';

describe('NomineesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NomineesService = TestBed.get(NomineesService);
    expect(service).toBeTruthy();
  });
});
