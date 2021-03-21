import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Category} from '../interfaces/Category';
import * as _ from 'underscore';
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

  get categories(): Observable<Category[]> {
    return this.maybeUpdateCache();
  }

  getCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      return this.getCategoryFromCache(id);
    });
  }

  getCategoryName(category: Category): string {
    const parts = category.name.split(' (');
    return parts[0];
  }

  getCategorySubtitle(category: Category): string {
    const parts = category.name.split(' (');
    if (parts.length > 1) {
      return parts[1].replace(')', '');
    } else {
      return undefined;
    }
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

  getWinnersForCurrentYear(category: Category): number[] {
    return [];
  }

  waitForWinnersForCurrentYear(category: Category): Observable<number[]> {
    return of([]);
  }

  addWinnerForCurrentYear(category: Category, nominee: Nominee) {
  }

  deleteWinnerForCurrentYear(category: Category, nominee: Nominee) {
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
