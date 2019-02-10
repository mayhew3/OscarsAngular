import {TestBed} from '@angular/core/testing';
/* tslint:disable quotemark */
import {CategoryService} from './category.service';
import {HttpClientTestingModule, HttpTestingController, RequestMatch} from '@angular/common/http/testing';
import {TestCategoryList} from './categories.test.mock';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpModule: HttpClientTestingModule;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  }));

  beforeEach(() => {
    service = TestBed.get(CategoryService);
    httpModule = TestBed.get(HttpClientTestingModule);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('nothing in cache initially', () => {
    expect(service.cache).toBeTruthy();
    expect(service.cache.length).toBe(0);
  });

  it('getCategories puts things in cache', (done) => {
    service.getCategories().subscribe((categories) => {
      expect(service.cache.length).toBeGreaterThan(0);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.length).toBe(service.cache.length);
      expect(categories.length).toBe(3);
      done();
    });
  });

  it('getCategory puts things in cache', (done) => {
    service.getCategory(2).subscribe((category) => {
      expect(category.id).toBe(2);
      done();
    });
  });

  it('getCategory returns nothing if id doesn\'t exist', (done) => {
    service.getCategory(5).subscribe((category) => {
      expect(category).toBeFalsy();
      done();
    });
  });

  it('getCategoryFromCache returns nothing initially', () => {
    expect(service.getCategoryFromCache(1)).toBeFalsy();
  });

  it('getCategoryFromCache returns element after cache populated', (done) => {
    service.maybeUpdateCache().subscribe(() => {
      const categoryFromCache = service.getCategoryFromCache(1);
      expect(categoryFromCache).toBeTruthy();
      expect(categoryFromCache.id).toBe(1);
      done();
    });
  });

  it('getCategoryFromCache returns nothing if id doesn\'t exist', (done) => {
    service.maybeUpdateCache().subscribe(() => {
      const categoryFromCache = service.getCategoryFromCache(5);
      expect(categoryFromCache).toBeFalsy();
      done();
    });
  });

  it('getNextCategory returns next category if exists', (done) => {
    service.getNextCategory(1).subscribe((category) => {
      expect(category.id).toBe(2);
      done();
    });
  });

  it('getNextCategory returns nothing if there is none', (done) => {
    service.getNextCategory(17).subscribe((category) => {
      expect(category).toBeFalsy();
    });
  });

  it('getNextCategory returns nothing if id argument is not a category', (done) => {
    service.getNextCategory(25).subscribe((category) => {
      expect(category).toBeFalsy();
      done();
    });
  });

  it('getPreviousCategory returns next category if exists', (done) => {
    service.getPreviousCategory(2).subscribe((category) => {
      expect(category.id).toBe(1);
      done();
    });
  });

  it('getPreviousCategory returns nothing if there is none', (done) => {
    service.getPreviousCategory(1).subscribe((category) => {
      expect(category).toBeFalsy();
      done();
    });
  });

  it('getPreviousCategory returns nothing if id argument is not a category', (done) => {
    service.getPreviousCategory(25).subscribe((category) => {
      expect(category).toBeFalsy();
      done();
    });
  });

  it('getNominees returns nominees for a category', (done) => {
    service.getNominees(1).subscribe((nominees) => {
      expect(nominees).toBeTruthy();
      expect(nominees.length).toBe(3);
      done();
    });
  });

  it('getNominees returns nothing for a category that doesn\'t exist', (done) => {
    service.getNominees(25).subscribe((nominees) => {
      expect(nominees).toBeTruthy();
      expect(nominees.length).toBe(0);
      done();
    });
  });

  it('updateNominee calls http put', () => {
    const mockNominee = {
      "odds_expert": 11,
      "category_id": 17,
      "context": "",
      "nominee": "My Nephew Emmett",
      "id": 2365
    };
    service.updateNominee(mockNominee);
    const mockReq = httpMock.expectOne(service.nomineesUrl);
    expect(mockReq.request.method).toBe('PUT');

    expect(mockReq.request.body)
  });

  it('maybeUpdateCache calls http get if cache is empty', () => {
    service.maybeUpdateCache().subscribe((categories) => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBe(3);
    });

    const testRequest = httpMock.expectOne(service.categoriesUrl);
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(TestCategoryList);

    httpMock.verify();
  });

  it('maybeUpdateCache doesn\'t call http get if there is a cache already', () => {
    // do an initial call to fill the cache
    service.maybeUpdateCache().subscribe();

    const testRequest = httpMock.expectOne(service.categoriesUrl);
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(TestCategoryList);

    httpMock.verify();

    // subsequent calls to maybeUpdateCache should just use the cache and do no HTTP request
    service.maybeUpdateCache().subscribe((categories) => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBe(3);
    });

    httpMock.expectNone(service.categoriesUrl);

    httpMock.verify();
  });

});
