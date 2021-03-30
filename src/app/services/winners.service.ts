import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Winner} from '../interfaces/Winner';
import {Category} from '../interfaces/Category';
import _ from 'underscore';
import {Store} from '@ngxs/store';
import {AddWinner, RemoveWinner} from '../actions/category.action';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class WinnersService {
  winnersUrl = 'api/winners';

  constructor(private http: HttpClient,
              private store: Store) { }

  private existingWinner(nominee: Nominee, category: Category): Winner {
    return _.find(category.winners, w => w.nomination_id === nominee.id);
  }

  addOrDeleteWinner(nominee: Nominee, category: Category): Observable<Winner> {
    const existing = this.existingWinner(nominee, category);
    if (!existing) {
      return this.store.dispatch(new AddWinner(nominee.category_id, nominee.year, nominee.id, new Date()));
    } else {
      return this.store.dispatch(new RemoveWinner(existing.category_id, existing.id));
    }
  }

  resetWinners(year: number): Observable<any> {
    const data = {year};
    return this.http.patch(this.winnersUrl, data, httpOptions)
      .pipe(
        catchError(this.handleError<any>('resetWinners', data))
      );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T): (obs: Observable<T>) => Observable<T> {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
