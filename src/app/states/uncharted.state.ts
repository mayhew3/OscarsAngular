import {Person} from '../interfaces/Person';
import {SystemVars} from '../interfaces/SystemVars';
import {Category} from '../interfaces/Category';
import {MaxYear} from '../interfaces/MaxYear';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Vote} from '../interfaces/Vote';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GetSystemVars} from '../actions/systemVars.action';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SystemVarsStateModel} from './systemVars.state';
import {GetPersons} from '../actions/person.action';
import {PersonStateModel} from './person.state';

export class UnchartedStateModel {
  persons: Person[];
  systemVars: SystemVars;
  categories: Category[];
  votes: Vote[];
  maxYear: MaxYear[];
}

@State<UnchartedStateModel>({
  name: 'uncharted',
  defaults: {
    persons: undefined,
    systemVars: undefined,
    categories: undefined,
    votes: undefined,
    maxYear: undefined
  }
})
@Injectable()
export class UnchartedState {
  constructor(private http: HttpClient) {
  }

  @Selector()
  static getPersonList(state: PersonStateModel): Person[] {
    return state.persons;
  }

  @Selector()
  static getSystemVars(state: SystemVarsStateModel): SystemVars {
    return state.systemVars;
  }

  @Action(GetPersons)
  getPersons({getState, setState}: StateContext<PersonStateModel>): Observable<any> {
    return this.http.get<any[]>('/api/persons').pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          persons: result
        });
      })
    );
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
