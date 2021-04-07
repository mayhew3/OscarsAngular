import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {OddsBundle} from '../interfaces/OddsBundle';
import {Store} from '@ngxs/store';
import {catchError, filter, map} from 'rxjs/operators';
import {GetOdds} from '../actions/odds.action';
import {ConnectednessService} from './connectedness.service';
import {MatSnackBar} from '@angular/material/snack-bar';

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
              private snackBar: MatSnackBar) {
    this.connectedService.connectedToAll$.subscribe(([isAuthenticated, isConnected]) => {
      if (isAuthenticated && isConnected) {
        this.store.dispatch(new GetOdds()).pipe(
          catchError(this.handleError())
        ).subscribe();
      }
    });
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {

      this.snackBar.open(error.body.error);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
