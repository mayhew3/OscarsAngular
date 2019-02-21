import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {SystemVars} from '../interfaces/SystemVars';
import {catchError} from 'rxjs/operators';
import {_} from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class SystemVarsService {
  systemVarsUrl = 'api/systemVars';
  private systemVars: SystemVars;

  constructor(private http: HttpClient) {
    this.getSystemVars().subscribe();
  }

  public canVote(): boolean {
    return this.systemVars && this.systemVars.voting_open;
  }

  public stillLoading(): boolean {
    return _.isUndefined(this.systemVars);
  }

  public getSystemVars(): Observable<SystemVars> {
    if (this.systemVars) {
      return of(this.systemVars);
    } else {
      return new Observable<SystemVars>(observer => {
        this.http.get<SystemVars[]>(this.systemVarsUrl)
          .pipe(
            catchError(this.handleError<SystemVars[]>('getSystemVars', []))
          )
          .subscribe((systemVars: SystemVars[]) => {
              if (systemVars.length !== 1) {
                throw new Error('Should only have one row in system vars.');
              }
              this.systemVars = systemVars[0];
              observer.next(systemVars[0]);
            },
            (err: Error) => observer.error(err));
      });
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
