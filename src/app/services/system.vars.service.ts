import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {SystemVars} from '../interfaces/SystemVars';
import {catchError, tap} from 'rxjs/operators';
import {_} from 'underscore';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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

  public getCurrentYear(): number {
    return this.systemVars ? this.systemVars.curr_year : undefined;
  }

  lockVotingInternal(): void {
    this.getSystemVars().subscribe(() => {
      this.systemVars.voting_open = false;
    });
  }

  unlockVotingInternal(): void {
    this.getSystemVars().subscribe(() => {
      this.systemVars.voting_open = true;
    });
  }

  public toggleVotingLock(): void {
    if (!this.systemVars) {
      throw new Error('No system vars found.');
    }
    const targetVars = {
      id: this.systemVars.id,
      curr_year: this.systemVars.curr_year,
      voting_open: !this.systemVars.voting_open
    };

    this.http.put(this.systemVarsUrl, targetVars, httpOptions)
      .pipe(
        tap(() => {
          this.systemVars.voting_open = !this.systemVars.voting_open;
        }),
        catchError(this.handleError<any>('toggleVotingLock'))
      ).subscribe();
  }

  public stillLoading(): boolean {
    return this.systemVars === undefined;
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
