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
  nomineesUrl = 'api/nominees';

  constructor(private http: HttpClient) { }

  // todo: Add override to in-memory-data to update category nominees.
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
