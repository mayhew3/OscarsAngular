import { Injectable } from '@angular/core';
import {Store} from '@ngxs/store';
import {filter, map} from 'rxjs/operators';
import {GetCeremonyYears} from '../actions/ceremony.action';
import {CeremonyYear} from '../interfaces/CeremonyYear';
import {combineLatest, firstValueFrom, Observable} from 'rxjs';
import _ from 'underscore';
import {Ceremony} from '../interfaces/Ceremony';
import {ApiService} from './api.service';
import {GroupYear} from '../interfaces/GroupYear';
import {Person} from '../interfaces/Person';
import {FinalResultsService} from './final-results.service';
import {groupNumber} from '../../shared/GlobalVars';
import {SystemVarsService} from './system.vars.service';

@Injectable({
  providedIn: 'root'
})
export class CeremonyService {
  ceremoniesUrl = '/api/ceremonies';

  ceremonies: Observable<Ceremony[]> = this.store.select(state => state.ceremonies).pipe(
    map(state => state.ceremonies),
    filter(ceremonies => !!ceremonies)
  );

  constructor(private store: Store,
              private api: ApiService,
              private finalResultsService: FinalResultsService,
              private systemVarsService: SystemVarsService) {
    this.store.dispatch(new GetCeremonyYears());
  }

  get ceremonyYearsFlattened(): Observable<CeremonyYear[]> {
    return this.ceremonies.pipe(
      map(ceremonies => _.flatten(_.map(ceremonies, ceremony => ceremony.ceremonyYears)))
    );
  }

  hasPastCeremonies(me: Person, ceremony_id: number): Observable<boolean> {
    const myGroups = [groupNumber];
    return this.finalResultsService.finalResults$.pipe(
      map(finalResults => {
        const eligibleResults = _.filter(finalResults, finalResult => _.contains(myGroups, finalResult.group_id) &&
          finalResult.ceremony_id === ceremony_id);
        return eligibleResults.length > 0;
      })
    );
  }

  getCurrentCeremonyYear(): Observable<CeremonyYear> {
    return combineLatest(([this.ceremonyYearsFlattened, this.systemVarsService.getCurrentCeremonyYearID()])).pipe(
      map(([ceremonyYears, ceremonyYearId]) => {
        const ceremonyYear = _.findWhere(ceremonyYears, {id: ceremonyYearId});
        if (!ceremonyYear) {
          throw new Error(`No ceremony_year found with ID ${ceremonyYearId}`);
        }
        return ceremonyYear;
      })
    );
  }

  getCurrentYear(): Observable<number> {
    return this.getCurrentCeremonyYear().pipe(
      map(cy => cy.year)
    );
  }

  getCurrentCeremony(): Observable<Ceremony> {
    return combineLatest(([this.ceremonies, this.getCurrentCeremonyYear()])).pipe(
      map(([ceremonies, ceremonyYear]) => _.findWhere(ceremonies, {id: ceremonyYear.ceremony_id}))
    );
  }

  getCurrentCeremonyName(): Observable<string> {
    return this.getCurrentCeremony().pipe(
      map(c => c.name)
    );
  }

  canVote(): Observable<boolean> {
    return this.getCurrentCeremonyYear().pipe(
      map(cy => !cy.voting_closed)
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

  async toggleVotingLock(): Promise<void> {
    const ceremonyYear = await firstValueFrom(this.getCurrentCeremonyYear());
    const data = {
      id: ceremonyYear.id,
      voting_closed: !ceremonyYear.voting_closed ? new Date() : null
    };
    await this.api.executePutAfterFullyConnected(this.ceremoniesUrl, data);
  }

  async addCeremonyYear(ceremony_date: Date,
                        ceremony_id: number,
                        year: number,
                        groupYears: Partial<GroupYear>[]): Promise<void> {
    const data = {
      ceremony_date,
      ceremony_id,
      year,
      groupYears
    };
    await this.api.postAfterFullyConnected(this.ceremoniesUrl, data);
  }
}
