import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {SystemVars} from '../interfaces/SystemVars';
import {filter, first, map} from 'rxjs/operators';
import {SocketService} from './socket.service';
import {MyAuthService} from './auth/my-auth.service';
import {Store} from '@ngxs/store';
import {ChangeCurrentYear, GetSystemVars, VotingLock, VotingUnlock} from '../actions/systemVars.action';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SystemVarsService implements OnDestroy {
  systemVarsUrl = 'api/systemVars';
  private _systemVars$ = new BehaviorSubject<SystemVars>(undefined);
  private _dataStore: {systemVars: SystemVars} = {systemVars: undefined};
  private _fetching = false;

  private _destroy$ = new Subject();

  systemVars = this.store.select(state => state.systemVars).pipe(
    map(state => state.systemVars),
    filter(systemVars => !!systemVars)
  );

  constructor(private http: HttpClient,
              private socket: SocketService,
              private auth: MyAuthService,
              private store: Store) {
    this._fetching = true;
    this.store.dispatch(new GetSystemVars(this.socket));
    this.systemVars.subscribe(() => this._fetching = false);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  canVote(): Observable<boolean> {
    return this.systemVars.pipe(
      map(systemVars => systemVars.voting_open)
    );
  }

  getCurrentYear(): Observable<number> {
    return this.systemVars.pipe(
      map(systemVars => systemVars.curr_year)
    );
  }

  toggleVotingLock(): void {
    this.systemVars.pipe(first())
      .subscribe(systemVars => {
        const data = {
          id: systemVars.id,
          voting_open: !systemVars.voting_open
        };
        this.http.put('/api/systemVars', data, httpOptions).subscribe();
      });
  }

  changeCurrentYear(year: number): Observable<any> {
    return this.store.dispatch(new ChangeCurrentYear(year));
  }

  stillLoading(): boolean {
    return this._fetching;
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
