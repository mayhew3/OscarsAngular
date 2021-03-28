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
import {GetPersons} from '../actions/person.action';
import {GetCategories} from '../actions/categories.action';

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
  static getPersonList(state: UnchartedStateModel): Person[] {
    return state.persons;
  }

  @Selector()
  static getSystemVars(state: UnchartedStateModel): SystemVars {
    return state.systemVars;
  }

  @Selector()
  static getCategories(state: UnchartedStateModel): Category[] {
    return state.categories;
  }

  @Action(GetPersons)
  getPersons({getState, setState}: StateContext<UnchartedStateModel>): Observable<any> {
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
  getSystemVars({getState, setState}: StateContext<UnchartedStateModel>): Observable<any> {
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

  @Action(GetCategories)
  getCategories({getState, setState}: StateContext<UnchartedStateModel>, action: GetCategories): Observable<any> {
    const params = {
      year: action.year.toString(),
      person_id: action.person_id.toString()
    };
    return this.http.get<any[]>('/api/categories', {params}).pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          categories: result
        });
      })
    );
  }

}
