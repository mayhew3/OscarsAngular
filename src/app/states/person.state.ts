import {Person} from '../interfaces/Person';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
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
    return new Observable<any>(observer => {
      this.http.get<any[]>('/api/persons').subscribe(result => {
          const state = getState();
          setState({
            ...state,
            persons: result
          });
          observer.next(undefined);
        }
      );
    });
  }
}

