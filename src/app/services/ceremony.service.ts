import { Injectable } from '@angular/core';
import {Store} from '@ngxs/store';
import {filter, map} from 'rxjs/operators';
import {GetCeremonyYears} from '../actions/ceremony.action';
import {CeremonyYear} from '../interfaces/CeremonyYear';
import {combineLatest, Observable} from 'rxjs';
import _ from 'underscore';
import {Ceremony} from '../interfaces/Ceremony';
import {ApiService} from './api.service';
import {GroupYear} from '../interfaces/GroupYear';
import {Person} from '../interfaces/Person';
import {FinalResultsService} from './final-results.service';
import {groupNumber} from '../../shared/GlobalVars';

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
              private finalResultsService: FinalResultsService) {
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
