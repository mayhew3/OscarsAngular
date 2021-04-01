import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Winner} from '../interfaces/Winner';
import {Category} from '../interfaces/Category';
import _ from 'underscore';
import {Store} from '@ngxs/store';
import {AddWinner, RemoveWinner, ResetWinners} from '../actions/category.action';

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

  addOrDeleteWinner(nominee: Nominee, category: Category): void {
    const existing = this.existingWinner(nominee, category);
    if (!existing) {
      const data = {
        category_id: category.id,
        year: nominee.year,
        nomination_id: nominee.id,
        declared: new Date(),
      };
      this.http.post<any>(this.winnersUrl, data, httpOptions).subscribe();
    } else {
      this.http.delete<Winner>(`/api/winners/${existing.id}`, httpOptions).subscribe();
    }
  }

  resetWinners(year: number): void {
    this.http.put<Winner>(`/api/resetWinners/`, {year}, httpOptions).subscribe();
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
