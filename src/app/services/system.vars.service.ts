import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {SystemVars} from '../interfaces/SystemVars';
import {catchError, filter, first, map, takeUntil, tap} from 'rxjs/operators';
import {SocketService} from './socket.service';
import {MyAuthService} from './auth/my-auth.service';
import {Store} from '@ngxs/store';
import {GetSystemVars, ToggleVotingLock} from '../actions/systemVars.action';

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

  systemVars: Observable<SystemVars>;

  constructor(private http: HttpClient,
              private socket: SocketService,
              private auth: MyAuthService,
              private store: Store) {
    this._fetching = true;
    this.store.dispatch(new GetSystemVars());
    this.systemVars = this.store.select(state => state.systemVars).pipe(
      map(state => state.systemVars),
      filter(systemVars => !!systemVars),
      tap(() => {
        this._fetching = false;
      })
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private refreshCache(): void {
    this.http.get<SystemVars[]>(this.systemVarsUrl)
      .pipe(
        takeUntil(this._destroy$),
        catchError(this.handleError<SystemVars[]>('getSystemVars', [])),
      )
      .subscribe((systemVars: SystemVars[]) => {
        if (systemVars.length !== 1) {
          throw new Error('Should only have one row in system vars.');
        }
        this._dataStore.systemVars = systemVars[0];
        this._fetching = false;
        this.initListeners();
      });
  }

  // todo: add to data init
  initListeners(): void {
    this.socket.on('voting', msg => {
      if (!!msg.voting_open) {
        this.unlockVotingInternal();
      } else {
        this.lockVotingInternal();
      }
    });
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

  lockVotingInternal(): void {
    this.systemVars.subscribe(() => {
      this._dataStore.systemVars.voting_open = false;
    });
  }

  unlockVotingInternal(): void {
    this.systemVars.subscribe(() => {
      this._dataStore.systemVars.voting_open = true;
    });
  }

  toggleVotingLock(): void {
    this.store.dispatch(new ToggleVotingLock());
  }

  changeCurrentYear(year: number): Observable<any> {
    const outsideThis = this;
    return new Observable<any>(observer => {
      const targetVars = {
        id: this._dataStore.systemVars.id,
        voting_open: this._dataStore.systemVars.voting_open,
        curr_year: year
      };

      this.http.put(this.systemVarsUrl, targetVars, httpOptions)
        .pipe(catchError(this.handleError<any>('changeCurrentYear')))
        .subscribe(() => {
          outsideThis._dataStore.systemVars.curr_year = year;
          observer.next();
        });
    });
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
