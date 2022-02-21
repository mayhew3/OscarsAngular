import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import produce from 'immer';
import * as _ from 'underscore';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';
import {CeremonyYear} from '../interfaces/CeremonyYear';
import {GetCeremonyYears} from '../actions/ceremony.action';
import {Ceremony} from '../interfaces/Ceremony';

export class CeremonyStateModel {
  ceremonies: Ceremony[];
}

@State<CeremonyStateModel>({
  name: 'ceremonies',
  defaults: {
    ceremonies: undefined
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
    const result = await this.api.getAfterFullyConnected<Ceremony[]>('/api/ceremonies');
    setState(
      produce( draft => {
        draft.ceremonies = result;
        _.each(draft.ceremonies, ceremony => {
          _.each(ceremony.ceremonyYears, ceremonyYear => {
            ceremonyYear.ceremony_date = new Date(ceremonyYear.ceremony_date);
            if (!!ceremonyYear.voting_closed) {
              ceremonyYear.voting_closed = new Date(ceremonyYear.voting_closed);
            }
          });
        });
      })
    );
    this.stateChanges++;
    this.logger.log('CEREMONIES State Change #' + this.stateChanges);
  }


}

