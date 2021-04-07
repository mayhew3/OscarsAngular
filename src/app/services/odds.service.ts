import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {OddsBundle} from '../interfaces/OddsBundle';
import {Store} from '@ngxs/store';
import {catchError, filter, map} from 'rxjs/operators';
import {GetOdds} from '../actions/odds.action';
import {ConnectednessService} from './connectedness.service';
import {ErrorNotificationService} from './error-notification.service';

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
              private connectedService: ConnectednessService,
              private store: Store,
              private errorHandler: ErrorNotificationService) {
    this.connectedService.connectedToAll$.subscribe(([isAuthenticated, isConnected]) => {
      if (isAuthenticated && isConnected) {
        this.store.dispatch(new GetOdds()).pipe(
          catchError(this.errorHandler.handleAPIError())
        ).subscribe();
      }
    });
  }

}
