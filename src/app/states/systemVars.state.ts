import {Action, State, StateContext} from '@ngxs/store';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {SystemVars} from '../interfaces/SystemVars';
import {ChangeCurrentYear, GetSystemVars, VotingLock, VotingUnlock} from '../actions/systemVars.action';
import produce from 'immer';
import {ApiService} from '../services/api.service';

export class SystemVarsStateModel {
  systemVars: SystemVars;
}

@State<SystemVarsStateModel>({
  name: 'systemVars',
  defaults: {
    systemVars: undefined
  }
})
@Injectable()
export class SystemVarsState {

  stateChanges = 0;

  readonly apiUrl = '/api/systemVars';

  constructor(private api: ApiService) {
  }

  @Action(GetSystemVars)
  getSystemVars({getState, setState}: StateContext<SystemVarsStateModel>): Observable<any> {
    return this.api.getAfterFullyConnected<any[]>(this.apiUrl).pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          systemVars: result[0]
        });
        this.stateChanges++;
        console.log('SYSTEMVARS State Change #' + this.stateChanges);
      })
    );
  }

  @Action(VotingLock)
  votingLock({setState}: StateContext<SystemVarsStateModel>): void {
    setState(
      produce(draft => {
        draft.systemVars.voting_open = false;
      })
    );
  }

  @Action(VotingUnlock)
  votingUnlock({setState}: StateContext<SystemVarsStateModel>): void {
    setState(
      produce(draft => {
        draft.systemVars.voting_open = true;
      })
    );
  }

  @Action(ChangeCurrentYear)
  changeCurrentYear({getState, setState}: StateContext<SystemVarsStateModel>, action: ChangeCurrentYear): Observable<any> {
    const state = getState();
    const data = {
      id: state.systemVars.id,
      curr_year: action.year
    };
    return this.api.putAfterFullyConnected(this.apiUrl, data).pipe(
      tap(() => {
        setState(
          produce(draft => {
            draft.systemVars.curr_year = action.year;
          })
        );
      })
    );
  }

}

