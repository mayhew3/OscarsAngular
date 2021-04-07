import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {filter, first, map} from 'rxjs/operators';
import {SocketService} from './socket.service';
import {MyAuthService} from './auth/my-auth.service';
import {Store} from '@ngxs/store';
import {ChangeCurrentYear, GetSystemVars} from '../actions/systemVars.action';
import {ConnectednessService} from './connectedness.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SystemVarsService implements OnDestroy {
  systemVarsUrl = '/api/systemVars';
  systemVars = this.store.select(state => state.systemVars).pipe(
    map(state => state.systemVars),
    filter(systemVars => !!systemVars)
  );

  private fetching = false;

  private destroy$ = new Subject();

  constructor(private http: HttpClient,
              private socket: SocketService,
              private auth: MyAuthService,
              private connectednessService: ConnectednessService,
              private store: Store) {
    this.fetching = true;
    this.connectednessService.connectedToAll$.subscribe(() => this.store.dispatch(new GetSystemVars(this.socket)));
    this.systemVars.subscribe(() => this.fetching = false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  changeCurrentYear(year: number): void {
    this.store.dispatch(new ChangeCurrentYear(year)).subscribe();
  }

  stillLoading(): boolean {
    return this.fetching;
  }


}
