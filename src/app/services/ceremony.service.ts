import { Injectable } from '@angular/core';
import {Store} from '@ngxs/store';
import {filter, map} from 'rxjs/operators';
import {GetCeremonyYears} from '../actions/ceremony.action';

@Injectable({
  providedIn: 'root'
})
export class CeremonyService {
  categoryYears = this.store.select(state => state.ceremonies).pipe(
    map(state => state.ceremonyYears),
    filter(ceremonyYears => !!ceremonyYears)
  );

  constructor(private store: Store) {
    this.store.dispatch(new GetCeremonyYears());
  }
}
