import {Person} from '../interfaces/Person';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ChangeOddsView, GetPersons} from '../actions/person.action';
import {Injectable} from '@angular/core';
import produce from 'immer';
import _ from 'underscore';
import {ApiService} from '../services/api.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export class PersonStateModel {
  persons: Person[];
}

@State<PersonStateModel>({
  name: 'persons',
  defaults: {
    persons: undefined
  }
})
@Injectable()
export class PersonState {
  stateChanges = 0;

  constructor(private apiService: ApiService,
              private http: HttpClient) {
  }

  @Action(GetPersons)
  getPersons({getState, setState}: StateContext<PersonStateModel>): Observable<any> {
    return this.apiService.getAfterAuthenticate<Person[]>('/api/persons').pipe(
      tap((result: Person[]) => {
        const state = getState();
        setState({
          ...state,
          persons: result
        });
        this.stateChanges++;
        console.log('PERSONS State Change #' + this.stateChanges);
      })
    );
  }

  @Action(ChangeOddsView)
  changeOddsView({getState, setState}: StateContext<PersonStateModel>, action: ChangeOddsView): Observable<any> {
    const data = {
      id: action.person_id,
      odds_filter: action.odds_filter
    };
    return this.http.put<any>('/api/persons', data, httpOptions).pipe(
      tap(() => {
        setState(
          produce(draft => {
            const existing = _.findWhere(draft.persons, {id: action.person_id});
            existing.odds_filter = action.odds_filter;
          })
        );
      })
    );
  }
}

