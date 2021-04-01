import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {SystemVars} from '../interfaces/SystemVars';
import {ChangeCurrentYear, GetSystemVars, VotingLock, VotingUnlock} from '../actions/systemVars.action';
import produce from 'immer';
import {SocketService} from '../services/socket.service';

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

  listenersInitialized = false;
  stateChanges = 0;

  readonly apiUrl = '/api/systemVars';

  constructor(private http: HttpClient,
              private socket: SocketService) {
  }

  private static logMessage(channelName: string, msg: any): void {
    console.log(`Received ${channelName} message: ${JSON.stringify(msg)}`);
  }

  maybeInitListeners(ctx: StateContext<SystemVarsStateModel>): void {
    if (!this.listenersInitialized) {

      this.socket.on('voting_locked', msg => {
        SystemVarsState.logMessage('voting_locked', msg);
        ctx.dispatch(new VotingLock());
      });

      this.socket.on('voting_unlocked', msg => {
        SystemVarsState.logMessage('voting_unlocked', msg);
        ctx.dispatch(new VotingUnlock());
      });

      this.listenersInitialized = true;
    }
  }

  @Action(GetSystemVars)
  getSystemVars(ctx: StateContext<SystemVarsStateModel>): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(result => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          systemVars: result[0]
        });
        this.stateChanges++;
        this.maybeInitListeners(ctx);
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
    return this.http.put(this.apiUrl, data, httpOptions).pipe(
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

