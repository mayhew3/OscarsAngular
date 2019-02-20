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
    service = TestBed.get(SystemVarsService);
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
  });

  function doFirstRequest() {
    const testRequest = httpMock.expectOne(service.systemVarsUrl);
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(MockSystemVars);

    httpMock.verify();
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSystemVars doesnt call http get if there is a cache already', () => {
    service.getSystemVars().subscribe();

    doFirstRequest();

    service.getSystemVars().subscribe(systemVars => {
      expect(systemVars).toBeTruthy();
      expect(systemVars.curr_year).toEqual(2018);
      expect(systemVars.votingOpen).toEqual(true);
    });

    httpMock.expectNone(service.systemVarsUrl);

    httpMock.verify();
  });

  describe('SystemVarsService tests that require single http get', () => {

    afterEach(() => {
      doFirstRequest();
    });

    it('getSystemVars calls http get', () => {
      service.getSystemVars().subscribe(systemVars => {
        expect(systemVars).toBeTruthy();
        expect(systemVars.curr_year).toEqual(2018);
        expect(systemVars.votingOpen).toEqual(true);
      });
    });
  });
});
