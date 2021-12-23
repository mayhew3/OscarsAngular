import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {MaxYear} from '../interfaces/MaxYear';
import {GetMaxYear} from '../actions/maxYear.action';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';

export class MaxYearStateModel {
  maxYear: MaxYear;
}

@State<MaxYearStateModel>({
  name: 'maxYear',
  defaults: {
    maxYear: undefined
  }
})
@Injectable()
export class MaxYearState {
  stateChanges = 0;

  constructor(private apiService: ApiService,
              private logger: LoggerService) {
  }

  @Action(GetMaxYear)
  async getMaxYear({getState, setState}: StateContext<MaxYearStateModel>): Promise<any> {
    const result = await this.apiService.getAfterFullyConnected<MaxYear[]>('/api/maxYear');
    const state = getState();
    setState({
      ...state,
      maxYear: result[0]
    });
    this.stateChanges++;
    this.logger.log('MAXYEAR State Change #' + this.stateChanges);
  }
}

