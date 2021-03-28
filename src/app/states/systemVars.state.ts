import {Action, Selector, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {GetPersons} from '../actions/person.action';
import {Injectable} from '@angular/core';
import {SystemVars} from '../interfaces/SystemVars';

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

  @Selector()
  static getSystemVars(state: SystemVarsStateModel): SystemVars {
    return state.systemVars;
  }

  @Action(GetPersons)
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

