import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {GetOdds, OddsInProgress, UpdatePlayerOdds} from '../actions/odds.action';
import {OddsBundle} from '../interfaces/OddsBundle';
import produce from 'immer';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';
import {HttpParams} from '@angular/common/http';

export class OddsStateModel {
  oddsBundle: OddsBundle;
  previousOddsBundle: OddsBundle;
  updating: boolean;
}

@State<OddsStateModel>({
  name: 'odds',
  defaults: {
    oddsBundle: undefined,
    previousOddsBundle: undefined,
    updating: true
  }
})
@Injectable()
export class OddsState {

  stateChanges = 0;

  readonly apiUrl = '/api/odds';

  constructor(private api: ApiService,
              private logger: LoggerService) {
  }

  @Selector()
  static updating(state: OddsStateModel): boolean {
    return state.updating;
  }

  @Action(GetOdds)
  async getOdds({setState}: StateContext<OddsStateModel>, action: GetOdds): Promise<any> {
    const params = new HttpParams()
      .set('year', action.year.toString());
    const result = await this.api.getAfterFullyConnected<any[]>(this.apiUrl, params);
    setState(produce(draft => {
      draft.previousOddsBundle = draft.oddsBundle;
      draft.oddsBundle = result;
      draft.updating = false;
    }));
    this.stateChanges++;
    this.logger.log('ODDS State Change #' + this.stateChanges);
  }

  @Action(UpdatePlayerOdds)
  updatePlayerOdds({setState}: StateContext<OddsStateModel>, action: UpdatePlayerOdds): void {
    setState(produce(draft => {
      draft.previousOddsBundle = draft.oddsBundle;
      draft.oddsBundle = action.oddsBundle;
      draft.updating = false;
    }));
  }

  @Action(OddsInProgress)
  oddsInProgress({setState}: StateContext<OddsStateModel>): void {
    setState(produce(draft => {
      draft.updating = true;
    }));
  }

}

