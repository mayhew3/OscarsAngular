import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Vote} from '../interfaces/Vote';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  votesUrl = 'api/votes';

  constructor(private http: HttpClient) { }

  getVoteForCategory(category_id: number, year: number, person_id: number): Observable<Vote> {
    const params = new HttpParams()
      .set('category_id', category_id.toString())
      .set('person_id', person_id.toString())
      .set('year', year.toString());
    return this.http.get<Vote>(this.votesUrl, {params: params})
      .pipe(
        catchError(this.handleError<Vote>('getVote'))
      );
  }

  addOrUpdateVote(vote: Vote): Observable<any> {
    return this.http.put(this.votesUrl, vote, httpOptions)
      .pipe(
        catchError(this.handleError<any>('addOrUpdateVote', vote))
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
