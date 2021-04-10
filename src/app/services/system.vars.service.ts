import {Injectable, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter, first, map} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {ChangeCurrentYear, GetSystemVars} from '../actions/systemVars.action';
import {ApiService} from './api.service';

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

  constructor(private store: Store,
              private api: ApiService) {
    this.fetching = true;
    this.store.dispatch(new GetSystemVars());
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
        this.api.executePutAfterFullyConnected(this.systemVarsUrl, data);
      });
  }

  changeCurrentYear(year: number): void {
    this.store.dispatch(new ChangeCurrentYear(year));
  }

  stillLoading(): boolean {
    return this.fetching;
  }


}
