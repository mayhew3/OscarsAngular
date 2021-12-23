import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {GetFinalResults} from '../actions/final-result.action';
import {FinalResult} from '../interfaces/FinalResult';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';
import {Category} from '../interfaces/Category';

export class FinalResultStateModel {
  finalResults: FinalResult[];
}

@State<FinalResultStateModel>({
  name: 'finalResults',
  defaults: {
    finalResults: undefined
  }
})
@Injectable()
export class FinalResultState {
  stateChanges = 0;

  constructor(private api: ApiService,
              private logger: LoggerService) {
  }

  @Action(GetFinalResults)
  async getFinalResults({getState, setState}: StateContext<FinalResultStateModel>): Promise<any> {
    const result = await this.api.getAfterFullyConnected<FinalResult[]>('/api/finalResults');
    const state = getState();
    setState({
      ...state,
      finalResults: result
    });
    this.stateChanges++;
    this.logger.log('FINALRESULTS State Change #' + this.stateChanges);
  }

}

