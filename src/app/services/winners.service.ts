import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Winner} from '../interfaces/Winner';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class WinnersService {
  winnersUrl = 'api/winners';

  constructor(private http: HttpClient) { }

  addOrDeleteWinner(nominee: Nominee): Observable<Winner> {
    const data = {
      category_id: nominee.category_id,
      year: nominee.year,
      nomination_id: nominee.id,
      declared: new Date()
    };
    return this.http.post<Winner>(this.winnersUrl, data, httpOptions)
      .pipe(
        catchError(this.handleError<any>('addOrDeleteWinner', data))
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
