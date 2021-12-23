import {Person} from '../interfaces/Person';
import {Action, State, StateContext} from '@ngxs/store';
import {ChangeOddsView, GetPersons, PersonConnected, PersonDisconnected} from '../actions/person.action';
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
  async getPersons({setState}: StateContext<PersonStateModel>): Promise<any> {
    const result = await this.api.getAfterAuthenticate<Person[]>('/api/persons');
    setState(
      produce(draft => {
        draft.persons = result;
      })
    );
    this.stateChanges++;
    this.logger.log('PERSONS State Change #' + this.stateChanges);
  }

  @Action(ChangeOddsView)
  async changeOddsView({getState, setState}: StateContext<PersonStateModel>, action: ChangeOddsView): Promise<any> {
    const data = {
      id: action.person_id,
      odds_filter: action.odds_filter
    };
    await this.api.putAfterFullyConnected<any>('/api/persons', data);
    setState(
      produce(draft => {
        const existing = _.findWhere(draft.persons, {id: action.person_id});
        existing.odds_filter = action.odds_filter;
      })
    );
  }

  @Action(PersonConnected)
  personConnected({getState, setState}: StateContext<PersonStateModel>, action: PersonConnected): void {
    setState(
      produce(draft => {
        const existing = _.findWhere(draft.persons, {id: action.person_id});
        existing.connected = true;
      })
    );
  }

  @Action(PersonDisconnected)
  personDisconnected({getState, setState}: StateContext<PersonStateModel>, action: PersonDisconnected): void {
    setState(
      produce(draft => {
        const existing = _.findWhere(draft.persons, {id: action.person_id});
        existing.connected = false;
      })
    );
  }

}

