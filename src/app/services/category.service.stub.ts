import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Category} from '../interfaces/Category';
import {_} from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {TestCategoryList} from './data/categories.test.mock';

@Injectable({
  providedIn: 'root'
})
export class CategoryServiceStub {
  cache: Category[];

  constructor() {
    this.cache = TestCategoryList;
  }

  // REAL METHODS

  getCategories(): Observable<Category[]> {
    return this.maybeUpdateCache();
  }

  getCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      return this.getCategoryFromCache(id);
    });
  }

  getCategoryFromCache(id: number): Category {
    return _.findWhere(this.cache, {id: id});
  }

  getNextCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this.cache, {id: id});
      if (foundIndex === -1 || this.cache.length < (foundIndex + 1)) {
        return null;
      }
      return this.cache[foundIndex + 1];
    });
  }

  getPreviousCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this.cache, {id: id});
      if (0 > (foundIndex - 1)) {
        return null;
      }
      return this.cache[foundIndex - 1];
    });
  }

  getNominees(category_id: number): Observable<Nominee[]> {
    return this.getDataWithCacheUpdate<Nominee[]>(() => {
      const category = this.getCategoryFromCache(category_id);
      return category ? category.nominees : [];
    });
  }

  updateNominee(nominee: Nominee): Observable<any> {
    return of(null);
  }

  stillLoading(): boolean {
    return false;
  }

  // DATA HELPERS

  getDataWithCacheUpdate<T>(getCallback): Observable<T> {
    return new Observable(observer => {
      this.maybeUpdateCache().subscribe(
        () => observer.next(getCallback()),
        (err: Error) => observer.error(err)
      );
    });
  }

  maybeUpdateCache(): Observable<Category[]> {
    return of(this.cache);
  }

}
