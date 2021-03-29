import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
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
    return new Observable<any>(observer => {
      this.http.get<any[]>('/api/systemVars').subscribe(result => {
        const state = getState();
        setState({
          ...state,
          systemVars: result[0]
        });
        observer.next(undefined);
      });
    });
  }
}

