import { Injectable } from '@angular/core';
import {Store} from '@ngxs/store';
import {filter, map} from 'rxjs/operators';
import {GetCeremonyYears} from '../actions/ceremony.action';
import {CeremonyYear} from '../interfaces/CeremonyYear';
import {Observable} from 'rxjs';
import _ from 'underscore';
import {Ceremony} from '../interfaces/Ceremony';

@Injectable({
  providedIn: 'root'
})
export class CeremonyService {
  ceremonies: Observable<Ceremony[]> = this.store.select(state => state.ceremonies).pipe(
    map(state => state.ceremonies),
    filter(ceremonies => !!ceremonies)
  );

  constructor(private store: Store) {
    this.store.dispatch(new GetCeremonyYears());
  }

  get ceremonyYearsFlattened(): Observable<CeremonyYear[]> {
    return this.ceremonies.pipe(
      map(ceremonies => _.flatten(_.map(ceremonies, ceremony => ceremony.ceremonyYears)))
    );
  }
}
