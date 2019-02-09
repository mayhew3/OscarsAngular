import {TestBed} from '@angular/core/testing';

import {CategoryService} from './category.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {InMemoryDataService} from './in-memory-data-service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      HttpClientInMemoryWebApiModule.forRoot(
        InMemoryDataService, { dataEncapsulation: false, delay: 0 }
      )]
  }));

  beforeEach(() => {
    service = TestBed.get(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('nothing in cache initially', () => {
    expect(service.cache).toBeTruthy();
    expect(service.cache.length).toBe(0);
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

  it('getCategoryFromCache returns nothing initially', () => {
    expect(service.getCategoryFromCache(1)).toBeFalsy();
  });

  it('getCategoryFromCache returns element after cache populated', () => {
    service.maybeUpdateCache().subscribe(() => {
      const categoryFromCache = service.getCategoryFromCache(1);
      expect(categoryFromCache).toBeTruthy();
      expect(categoryFromCache.id).toBe(1);
    });
  });

  it('getCategoryFromCache returns nothing if id doesn\'t exist', () => {
    service.maybeUpdateCache().subscribe(() => {
      const categoryFromCache = service.getCategoryFromCache(5);
      expect(categoryFromCache).toBeFalsy();
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

  it('updateNominee calls http put', () => {

  });

  it('maybeUpdateCache doesn\'t call http get if there is a cache already', () => {

  });

  it('maybeUpdateCache calls http get if cache is empty', () => {

  });

});
