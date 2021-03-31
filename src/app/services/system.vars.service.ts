import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {SystemVars} from '../interfaces/SystemVars';
import {catchError, filter, map, takeUntil} from 'rxjs/operators';
import {SocketService} from './socket.service';
import {MyAuthService} from './auth/my-auth.service';
import {Store} from '@ngxs/store';
import {ChangeCurrentYear, GetSystemVars, ToggleVotingLock} from '../actions/systemVars.action';

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
    this.store.dispatch(new GetSystemVars());
    this.systemVars.subscribe(() => this._fetching = false);
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
    // todo: first() if end up using this code.
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
