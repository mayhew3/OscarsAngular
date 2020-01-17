import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Nominee} from '../interfaces/Nominee';
import {Winner} from '../interfaces/Winner';
import {Socket} from 'ngx-socket-io';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class WinnersService {
  winnersUrl = 'api/winners';

  constructor(private http: HttpClient,
              private socket: Socket) { }

  addOrDeleteWinner(nominee: Nominee, deleting: boolean): Observable<Winner> {
    return new Observable<Winner>(observer => {
      const data = {
        category_id: nominee.category_id,
        year: nominee.year,
        nomination_id: nominee.id,
        declared: new Date()
      };

      this.http.post<Winner>(this.winnersUrl, data, httpOptions).subscribe(winner => {
        const msg = {
          detail: deleting ? 'delete' : 'add',
          data: winner
        };

        this.socket.emit('winner', msg);
        observer.next(winner);
      }, (err: Error) => observer.error(err));
    });
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
