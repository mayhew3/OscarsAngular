import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscriber} from 'rxjs';
import {OddsBundle} from '../interfaces/OddsBundle';
import {SocketService} from './socket.service';
import * as _ from 'underscore';
import {Store} from '@ngxs/store';
import {filter, map} from 'rxjs/operators';
import {GetOdds} from '../actions/odds.action';

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

  constructor(private http: HttpClient,
              private socket: SocketService,
              private store: Store) {
    this.store.dispatch(new GetOdds());
  }

}
