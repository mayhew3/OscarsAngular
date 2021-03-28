import {Person} from '../interfaces/Person';
import {SystemVars} from '../interfaces/SystemVars';
import {Category} from '../interfaces/Category';
import {MaxYear} from '../interfaces/MaxYear';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Vote} from '../interfaces/Vote';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {GetSystemVars} from '../actions/systemVars.action';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {GetPersons} from '../actions/person.action';
import {GetCategories} from '../actions/categories.action';
import {GetVotes} from '../actions/votes.action';
import {GetMaxYear} from '../actions/maxYear.action';

export class OscarsStateModel {
  persons: Person[];
  systemVars: SystemVars;
  categories: Category[];
  votes: Vote[];
  maxYear: MaxYear[];
}

@State<OscarsStateModel>({
  name: 'oscars',
  defaults: {
    persons: undefined,
    systemVars: undefined,
    categories: undefined,
    votes: undefined,
    maxYear: undefined
  }
})
@Injectable()
export class OscarsState {
  constructor(private http: HttpClient) {
  }

  @Action(GetPersons)
  getPersons({getState, setState}: StateContext<OscarsStateModel>): Observable<any> {
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
  getSystemVars({getState, setState}: StateContext<OscarsStateModel>): Observable<any> {
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
  getCategories({getState, setState}: StateContext<OscarsStateModel>, action: GetCategories): Observable<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString())
      .set('year', action.year.toString());
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

  @Action(GetVotes)
  getVotes({getState, setState}: StateContext<OscarsStateModel>, action: GetVotes): Observable<any> {
    const params = new HttpParams()
      .set('year', action.year.toString());
    return this.http.get<any[]>('/api/votes', {params}).pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          votes: result
        });
      })
    );
  }

  @Action(GetMaxYear)
  getMaxYear({getState, setState}: StateContext<OscarsStateModel>): Observable<any> {
    return this.http.get<any[]>('/api/maxYear').pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          maxYear: result[0]
        });
      })
    );
  }

}
