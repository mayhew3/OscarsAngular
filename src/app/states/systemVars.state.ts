import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {SystemVars} from '../interfaces/SystemVars';
import {GetSystemVars, ToggleVotingLock} from '../actions/systemVars.action';
import produce from 'immer';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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

  constructor(private http: HttpClient) {
  }

  @Action(GetSystemVars)
  getSystemVars({getState, setState}: StateContext<SystemVarsStateModel>): Observable<any> {
    return this.http.get<any[]>('/api/systemVars').pipe(
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

  @Action(ToggleVotingLock)
  toggleVotingLock({getState, setState}: StateContext<SystemVarsStateModel>): Observable<any> {
    const state = getState();
    const targetVotingOpen = !state.systemVars.voting_open;
    const data = {
      id: state.systemVars.id,
      voting_open: targetVotingOpen
    };
    return this.http.put('/api/systemVars', data, httpOptions).pipe(
      tap(() => {
        setState(
          produce(draft => {
            draft.systemVars.voting_open = targetVotingOpen;
          })
        );
      })
    );
  }

}

