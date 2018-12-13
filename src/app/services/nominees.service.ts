import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class NomineesService {
  categoriesUrl = 'api/categories';
  nomineesUrl = 'api/nominees';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl)
      .pipe(
        catchError(this.handleError('getCategories', []))
      );
  }

  getNominees(category_id: number): Observable<Nominee[]> {
    const options = { params: new HttpParams().set('category_id', `${category_id}`)};

    return this.http.get<Nominee[]>(this.nomineesUrl, options)
      .pipe(
        catchError(this.handleError('getNominees', []))
      );
  }

  updateNominee(nominee: Nominee): Observable<any> {
    return this.http.put(this.nomineesUrl, nominee, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateNominee', nominee))
      );
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
