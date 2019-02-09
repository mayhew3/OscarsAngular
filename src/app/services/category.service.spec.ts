import {TestBed, tick} from '@angular/core/testing';

import { CategoryService } from './category.service';
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

  it('nothing in cache initially', () => {

  });

  it('nothing in cache initially', () => {

  });

  it('nothing in cache initially', () => {

  });

  it('nothing in cache initially', () => {

  });

  it('nothing in cache initially', () => {

  });

});
