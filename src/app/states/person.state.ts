import {Person} from '../interfaces/Person';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {GetPersons} from '../actions/person.action';
import {Injectable} from '@angular/core';

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
  constructor(private http: HttpClient) {
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
}

