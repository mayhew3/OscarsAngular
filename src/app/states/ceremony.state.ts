import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import produce from 'immer';
import * as _ from 'underscore';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';
import {CeremonyYear} from '../interfaces/CeremonyYear';
import {GetCeremonyYears} from '../actions/ceremony.action';

export class CeremonyStateModel {
  ceremonyYears: CeremonyYear[];
}

@State<CeremonyStateModel>({
  name: 'ceremonies',
  defaults: {
    ceremonyYears: undefined
  }
})
@Injectable()
export class CeremonyState {
  stateChanges = 0;

  constructor(private api: ApiService,
              private logger: LoggerService) {
  }

  @Action(GetCeremonyYears)
  async getVotes({setState}: StateContext<CeremonyStateModel>): Promise<any> {
    const result = await this.api.getAfterFullyConnected<CeremonyYear[]>('/api/ceremonies');
    setState(
      produce( draft => {
        draft.ceremonyYears = result;
        _.each(draft.ceremonyYears, ceremonyYear => {
          ceremonyYear.date_added = new Date(ceremonyYear.date_added);
          ceremonyYear.ceremony_date = new Date(ceremonyYear.ceremony_date);
          if (!!ceremonyYear.voting_closed) {
            ceremonyYear.voting_closed = new Date(ceremonyYear.voting_closed);
          }
        });
      })
    );
    this.stateChanges++;
    this.logger.log('CEREMONIES State Change #' + this.stateChanges);
  }


}

