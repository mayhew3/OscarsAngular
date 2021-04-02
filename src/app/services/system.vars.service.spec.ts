import {TestBed} from '@angular/core/testing';

import {SystemVarsService} from './system.vars.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MockSystemVars} from './data/system.vars.mock';

describe('System.VarsService', () => {
  let service: SystemVarsService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  }));

  beforeEach(() => {
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(SystemVarsService);

    const testRequest = httpMock.expectOne(service.systemVarsUrl);
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(MockSystemVars);

    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSystemVars doesnt call http get if there is a cache already', () => {

    service.systemVars.subscribe(systemVars => {
      expect(systemVars).toBeTruthy();
      expect(systemVars.curr_year).toEqual(2018);
      expect(systemVars.voting_open).toEqual(true);
    });

    httpMock.expectNone(service.systemVarsUrl);

    httpMock.verify();
  });

});
