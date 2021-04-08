import {Action, State, StateContext} from '@ngxs/store';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {GetFinalResults} from '../actions/final-result.action';
import {FinalResult} from '../interfaces/FinalResult';
import {ApiService} from '../services/api.service';

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

  constructor(private api: ApiService) {
  }

  @Action(GetFinalResults)
  getFinalResults({getState, setState}: StateContext<FinalResultStateModel>): Observable<any> {
    return this.api.getAfterFullyConnected<any[]>('/api/finalResults').pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          finalResults: result
        });
        this.stateChanges++;
        console.log('FINALRESULTS State Change #' + this.stateChanges);
      })
    );
  }

}

