import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError, tap} from 'rxjs/operators';
import {_} from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  categoriesUrl = 'api/categories';
  cache = [];

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl)
      .pipe(
        tap((categories => this.cache = categories)),
        catchError(this.handleError('getCategories', []))
      );
  }

  getCategory(id: number): Observable<Category> {
    if (this.cache.length > 0) {
      return of(_.findWhere(this.cache, {id: id}));
    }
    const url = `${this.categoriesUrl}/${id}`;
    return this.http.get<Category>(url)
      .pipe(
        catchError(this.handleError<Category>(`getCategory id=${id}`))
      );
  }

  getNextCategory(id: number): Category {
    if (this.cache.length === 0) {
      return null;
    }
    const foundIndex = _.findIndex(this.cache, {id: id});
    if (this.cache.length < (foundIndex + 1)) {
      return null;
    }
    return this.cache[foundIndex + 1];
  }

  getPreviousCategory(id: number): Category {
    if (this.cache.length === 0) {
      return null;
    }
    const foundIndex = _.findIndex(this.cache, {id: id});
    if (0 > (foundIndex - 1)) {
      return null;
    }
    return this.cache[foundIndex - 1];
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
