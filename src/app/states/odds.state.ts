import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {GetOdds, UpdatePlayerOdds} from '../actions/odds.action';
import {OddsBundle} from '../interfaces/OddsBundle';
import produce from 'immer';
import _ from 'underscore';

export class OddsStateModel {
  oddsBundle: OddsBundle;
  previousOddsBundle: OddsBundle;
}

@State<OddsStateModel>({
  name: 'odds',
  defaults: {
    oddsBundle: undefined,
    previousOddsBundle: undefined
  }
})
@Injectable()
export class OddsState {

  stateChanges = 0;

  readonly apiUrl = '/api/odds';

  constructor(private http: HttpClient) {
  }

  @Action(GetOdds)
  getOdds({setState}: StateContext<OddsStateModel>): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(result => {
        setState(produce(draft => {
          draft.previousOddsBundle = draft.oddsBundle;
          draft.oddsBundle = result;
        }));
        this.stateChanges++;
        console.log('ODDS State Change #' + this.stateChanges);
      })
    );
  }

  @Action(UpdatePlayerOdds)
  updatePlayerOdds({getState, setState}: StateContext<OddsStateModel>, action: UpdatePlayerOdds): void {
    setState(produce(draft => {
      draft.previousOddsBundle = draft.oddsBundle;
      draft.oddsBundle = action.oddsBundle;
    }));
    this.stateChanges++;
    console.log('ODDS State Change #' + this.stateChanges);
  }

}

