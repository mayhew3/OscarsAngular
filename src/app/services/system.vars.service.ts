import {Injectable} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {ChangeCurrentYear, GetSystemVars, ToggleHideWinnerless, ToggleHideWinners} from '../actions/systemVars.action';
import {ApiService} from './api.service';
import {SystemVars} from '../interfaces/SystemVars';

@Injectable({
  providedIn: 'root'
})
export class SystemVarsService {
  systemVarsUrl = '/api/systemVars';
  systemVars = this.store.select(state => state.systemVars).pipe(
    map(state => state.systemVars),
    filter(systemVars => !!systemVars)
  );

  systemVarsYearChanges$ = this.systemVars.pipe(
    distinctUntilChanged((s1: SystemVars, s2: SystemVars) => s1.curr_year === s2.curr_year)
  );

  constructor(private store: Store,
              private api: ApiService) {
    this.store.dispatch(new GetSystemVars());
  }

  canVote(): Observable<boolean> {
    return this.systemVars.pipe(
      map(systemVars => systemVars.voting_open)
    );
  }

  getCurrentYear(): Observable<number> {
    return this.systemVarsYearChanges$.pipe(
      map(systemVars => systemVars.curr_year)
    );
  }

  async toggleVotingLock(): Promise<void> {
    const systemVars = await firstValueFrom(this.systemVars);
    const data = {
      id: systemVars.id,
      voting_open: !systemVars.voting_open
    };
    this.api.executePutAfterFullyConnected(this.systemVarsUrl, data);
  }

  toggleWinners(): void {
    this.store.dispatch(new ToggleHideWinners());
  }

  toggleWinnerless(): void {
    this.store.dispatch(new ToggleHideWinnerless());
  }

  changeCurrentYear(year: number): void {
    this.store.dispatch(new ChangeCurrentYear(year));
  }


}
