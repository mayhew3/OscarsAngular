import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Event} from '../interfaces/Event';
import {catchError} from 'rxjs/operators';
import {Category} from '../interfaces/Category';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  eventsUrl = 'api/events';

  constructor(private http: HttpClient) { }

  getEvents(sinceDate: Date): Observable<Event[]> {
    const options = {
      params: {
        since_date: sinceDate.getTime().toString()
      }
    };
    return this.http.get<Event[]>(this.eventsUrl, options)
      .pipe(
        catchError(this.handleError<Event[]>('getEvents', []))
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
