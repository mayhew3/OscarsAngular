import {Person} from '../interfaces/Person';
import {Action, State, StateContext} from '@ngxs/store';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ChangeOddsView, GetPersons} from '../actions/person.action';
import {Injectable} from '@angular/core';
import produce from 'immer';
import _ from 'underscore';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';

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

  constructor(private api: ApiService,
              private logger: LoggerService) {
  }

  @Action(GetPersons)
  getPersons({getState, setState}: StateContext<PersonStateModel>): Observable<any> {
    return this.api.getAfterAuthenticate<Person[]>('/api/persons').pipe(
      tap((result: Person[]) => {
        const state = getState();
        setState({
          ...state,
          persons: result
        });
        this.stateChanges++;
        this.logger.log('PERSONS State Change #' + this.stateChanges);
      })
    );
  }

  @Action(ChangeOddsView)
  changeOddsView({getState, setState}: StateContext<PersonStateModel>, action: ChangeOddsView): Observable<any> {
    const data = {
      id: action.person_id,
      odds_filter: action.odds_filter
    };
    return this.api.putAfterFullyConnected<any>('/api/persons', data).pipe(
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

