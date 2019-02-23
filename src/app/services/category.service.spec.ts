import {TestBed} from '@angular/core/testing';
/* tslint:disable quotemark */
import {CategoryService} from './category.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestCategoryList} from './data/categories.test.mock';
import {AuthService} from './auth/auth.service';
import {AuthServiceStub} from './auth/auth.service.stub';
import {SystemVarsService} from './system.vars.service';
import {SystemVarsServiceStub} from './system.vars.service.stub';
import {VotesService} from './votes.service';
import {VotesServiceStub} from './votes.service.stub';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      {provide: AuthService, useClass: AuthServiceStub},
      {provide: SystemVarsService, useClass: SystemVarsServiceStub},
      {provide: VotesService, useClass: VotesServiceStub}
    ]
  }));

  beforeEach(() => {
    service = TestBed.get(CategoryService);
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
  });

  function doFirstCategoriesRequest() {
    const testRequest = httpMock.expectOne(req => req.url === service.categoriesUrl);
    expect(testRequest.request.method).toBe('GET');
    expect(testRequest.request.params).toMatch('person_id=18&year=2018');
    testRequest.flush(TestCategoryList);

    httpMock.verify();
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('nothing in cache initially', () => {
    expect(service.cache).toBeTruthy();
    expect(service.cache.length).toBe(0);
  });

  it('updateNominee calls http put', () => {
    const mockNominee = {
      "odds_expert": 11,
      "category_id": 17,
      "year": 2017,
      "context": "",
      "detail": "",
      "nominee": "My Nephew Emmett",
      "id": 2365
    };

    service.updateNominee(mockNominee).subscribe();
    const mockReq = httpMock.expectOne(service.nomineesUrl);
    expect(mockReq.request.method).toBe('PUT');
    expect(mockReq.request.body).toBe(mockNominee);

    httpMock.verify();
  });

  it('getCategories doesn\'t call http get if there is a cache already', () => {
    // do an initial call to fill the cache
    service.getCategories().subscribe();

    doFirstCategoriesRequest();

    // subsequent calls to getCategories should just use the cache and do no HTTP request
    service.getCategories().subscribe((categories) => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBe(3);
    });

    httpMock.expectNone(req => req.url === service.categoriesUrl);

    httpMock.verify();
  });

  // everything that requires getCategories after this

  describe('CategoryService tests that require maybeUpdateCache', () => {

    afterEach(() => {
      doFirstCategoriesRequest();
    });

    it('getCategories calls http get if cache is empty', () => {
      service.getCategories().subscribe((categories) => {
        expect(categories).toBeTruthy();
        expect(categories.length).toBe(3);
      });
    });

    it('getCategories puts things in cache', () => {
      service.getCategories().subscribe((categories) => {
        expect(service.cache.length).toBeGreaterThan(0);
        expect(categories.length).toBeGreaterThan(0);
        expect(categories.length).toBe(service.cache.length);
        expect(categories.length).toBe(3);
      });
    });

    it('getCategory puts things in cache', () => {
      service.getCategory(2).subscribe((category) => {
        expect(category.id).toBe(2);
      });
    });

    it('getCategory returns nothing if id doesn\'t exist', () => {
      service.getCategory(5).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getNextCategory returns next category if exists', () => {
      service.getNextCategory(1).subscribe((category) => {
        expect(category.id).toBe(2);
      });
    });

    it('getNextCategory returns nothing if there is none', () => {
      service.getNextCategory(17).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getNextCategory returns nothing if id argument is not a category', () => {
      service.getNextCategory(25).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getPreviousCategory returns next category if exists', () => {
      service.getPreviousCategory(2).subscribe((category) => {
        expect(category.id).toBe(1);
      });
    });

    it('getPreviousCategory returns nothing if there is none', () => {
      service.getPreviousCategory(1).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getPreviousCategory returns nothing if id argument is not a category', () => {
      service.getPreviousCategory(25).subscribe((category) => {
        expect(category).toBeFalsy();
      });
    });

    it('getNominees returns nominees for a category', () => {
      service.getNominees(1).subscribe((nominees) => {
        expect(nominees).toBeTruthy();
        expect(nominees.length).toBe(3);
      });
    });

    it('getNominees returns nothing for a category that doesn\'t exist', () => {
      service.getNominees(25).subscribe((nominees) => {
        expect(nominees).toBeTruthy();
        expect(nominees.length).toBe(0);
      });
    });

  });

});
