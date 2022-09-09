import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {OddsBundle} from '../interfaces/OddsBundle';
import {Store} from '@ngxs/store';
import {filter, map} from 'rxjs/operators';
import {GetOdds} from '../actions/odds.action';
import {SystemVarsService} from './system.vars.service';
import {CeremonyService} from './ceremony.service';

@Injectable({
  providedIn: 'root'
})
export class OddsService {

  odds$: Observable<OddsBundle> = this.store.select(state => state.odds).pipe(
    filter(model => !!model),
    map(model => model.oddsBundle),
    filter(oddsBundle => !!oddsBundle)
  );

  previousOdds$: Observable<OddsBundle> = this.store.select(state => state.odds).pipe(
    filter(model => !!model),
    map(model => model.previousOddsBundle)
  );

  constructor(private store: Store,
              private ceremonyService: CeremonyService) {
    this.ceremonyService.getCurrentYear().subscribe(year => {
      this.store.dispatch(new GetOdds(year));
    });
  }

}
