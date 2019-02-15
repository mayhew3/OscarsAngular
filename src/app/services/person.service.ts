import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError, tap} from 'rxjs/operators';
import {_} from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {Person} from '../interfaces/Person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  personsUrl = 'api/persons';
  cache: Person[];

  constructor(private http: HttpClient) {
    this.cache = [];
  }

  // HELPERS

  private static addToArray<T>(existingArray: T[], newArray: T[]) {
    existingArray.push.apply(existingArray, newArray);
  }

  // REAL METHODS

  getPersons(): Observable<Person[]> {
    return this.maybeUpdateCache();
  }

  getPerson(id: number): Observable<Person> {
    return this.getDataWithCacheUpdate<Person>(() => {
      return this.getPersonFromCache(id);
    });
  }

  private getPersonFromCache(id: number): Person {
    return _.findWhere(this.cache, {id: id});
  }


  // DATA HELPERS

  private getDataWithCacheUpdate<T>(getCallback): Observable<T> {
    return new Observable(observer => {
      this.maybeUpdateCache().subscribe(
        () => observer.next(getCallback()),
        (err: Error) => observer.error(err)
      );
    });
  }

  private maybeUpdateCache(): Observable<Person[]> {
    if (this.cache.length === 0) {
      return new Observable<Person[]>((observer) => {
        this.http.get<Person[]>(this.personsUrl)
          .pipe(
            catchError(this.handleError<Person[]>('getPersons', []))
          )
          .subscribe(
            (categories: Person[]) => {
              PersonService.addToArray(this.cache, categories);
              observer.next(categories);
            },
            (err: Error) => observer.error(err)
          );
      });
    } else {
      return of(this.cache);
    }
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
