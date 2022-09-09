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

  async getCurrentCeremonyYear(): Promise<CeremonyYear> {
    const year = await firstValueFrom(this.systemVarsService.getCurrentYear());
    const ceremonyName = await firstValueFrom(this.systemVarsService.getCurrentCeremonyName());
    const ceremonies = await firstValueFrom(this.ceremonies);
    const matchingCeremonies = _.filter(ceremonies, c => c.name === ceremonyName);

    if (matchingCeremonies.length > 1) {
      throw new Error(`Multiple ceremonies with name '${ceremonyName}'`);
    } else if (matchingCeremonies.length < 1) {
      throw new Error(`No ceremony found with name '${ceremonyName}`);
    }

    const ceremony = matchingCeremonies[0];
    const matchingCeremonyYears = _.filter(ceremony.ceremonyYears, cy => cy.year === year);

    if (matchingCeremonyYears.length > 1) {
      throw new Error(`Multiple ceremonyYears with name '${year}'`);
    } else if (matchingCeremonyYears.length < 1) {
      throw new Error(`No ceremonyYear found with name '${year}`);
    }

    return matchingCeremonyYears[0];
  }

  async toggleVotingLock(): Promise<void> {
    const ceremonyYear = await this.getCurrentCeremonyYear();
    const data = {
      id: ceremonyYear.id,
      voting_closed: !ceremonyYear.voting_closed
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
