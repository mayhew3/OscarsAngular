import {Injectable} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {GetSystemVars, ToggleHideWinnerless, ToggleHideWinners} from '../actions/systemVars.action';
import {ApiService} from './api.service';
import {SystemVars} from '../interfaces/SystemVars';

@Injectable({
  providedIn: 'root'
})
export class SystemVarsService {
  systemVarsUrl = '/api/systemVars';
  systemVars: Observable<SystemVars> = this.store.select(state => state.systemVars).pipe(
    map(state => state.systemVars),
    filter(Boolean)
  );

  systemVarsCeremonyYearChanges$ = this.systemVars.pipe(
    distinctUntilChanged((s1: SystemVars, s2: SystemVars) => s1.ceremony_year_id === s2.ceremony_year_id)
  );

  constructor(private store: Store,
              private api: ApiService) {
    this.store.dispatch(new GetSystemVars());
  }

  getCurrentCeremonyYear(): Observable<number> {
    return this.systemVarsCeremonyYearChanges$.pipe(
      map(systemVars => systemVars.ceremony_year_id)
    );
  }

  getCurrentYear(): Observable<number> {
    return this.systemVarsCeremonyYearChanges$.pipe(
      map(systemVars => systemVars.curr_year)
    );
  }

  getCurrentCeremonyName(): Observable<string> {
    return this.systemVarsCeremonyYearChanges$.pipe(
      map(systemVars => systemVars.ceremony_name)
    );
  }

  isOscars(): Observable<boolean> {
    return this.getCurrentCeremonyName().pipe(
      map(ceremonyName => ceremonyName === 'Oscars')
    );
  }

  isEmmys(): Observable<boolean> {
    return this.getCurrentCeremonyName().pipe(
      map(ceremonyName => ceremonyName === 'Emmys')
    );
  }

  toggleWinners(): void {
    this.store.dispatch(new ToggleHideWinners());
  }

  toggleWinnerless(): void {
    this.store.dispatch(new ToggleHideWinnerless());
  }

  async changeActiveCeremonyYear(ceremony_year_id: number): Promise<void> {
    const systemVars = await firstValueFrom(this.systemVars);
    const data = {
      id: systemVars.id,
      ceremony_year_id
    };
    await this.api.putAfterFullyConnected(this.systemVarsUrl, data);
  }

  changeCurrentYear(year: number): void {
    // this.store.dispatch(new ChangeActiveCeremonyYear(year));
  }


}
