import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {SystemVars} from '../interfaces/SystemVars';
import {GetSystemVars} from '../actions/systemVars.action';

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
      })
    );
  }
}

