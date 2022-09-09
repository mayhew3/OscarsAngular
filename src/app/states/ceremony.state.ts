import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import produce from 'immer';
import * as _ from 'underscore';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';
import {AddCeremonyYear, GetCeremonyYears} from '../actions/ceremony.action';
import {Ceremony} from '../interfaces/Ceremony';
import {VotingLock, VotingUnlock} from '../actions/ceremony.action';
import {SystemVarsStateModel} from './systemVars.state';
import {WritableDraft} from 'immer/dist/types/types-external';
import {CeremonyYear} from '../interfaces/CeremonyYear';

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
  async getCeremonies({setState}: StateContext<CeremonyStateModel>): Promise<any> {
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

  @Action(AddCeremonyYear)
  async addCeremony({setState}: StateContext<CeremonyStateModel>, action: AddCeremonyYear): Promise<any> {
    setState(
      produce( draft => {
        const ceremony = _.findWhere(draft.ceremonies, {id: action.ceremonyYear.ceremony_id});
        action.ceremonyYear.ceremony_date = new Date(action.ceremonyYear.ceremony_date);
        if (!!action.ceremonyYear.voting_closed) {
          action.ceremonyYear.voting_closed = new Date(action.ceremonyYear.voting_closed);
        }
        ceremony.ceremonyYears.push(action.ceremonyYear);
      })
    );
    this.stateChanges++;
    this.logger.log('CEREMONIES State Change #' + this.stateChanges);
  }

  @Action(VotingLock)
  votingLock({setState}: StateContext<CeremonyStateModel>, action: VotingLock): void {
    setState(
      produce(draft => {
        const ceremonyYear = this.getCeremonyYearWithId(action.ceremony_year_id, draft.ceremonies);
        ceremonyYear.voting_closed = true;
      })
    );
  }

  @Action(VotingUnlock)
  votingUnlock({setState}: StateContext<CeremonyStateModel>, action: VotingUnlock): void {
    setState(
      produce(draft => {
        const ceremonyYear = this.getCeremonyYearWithId(action.ceremony_year_id, draft.ceremonies);
        ceremonyYear.voting_closed = false;
      })
    );
  }

  private getCeremonyYearWithId(ceremony_year_id: number, ceremonies: WritableDraft<Ceremony[]>): WritableDraft<CeremonyYear> {
    const ceremonyYears = _.flatten(_.map(ceremonies, c => c.ceremonyYears));
    const matching = _.findWhere(ceremonyYears, {id: ceremony_year_id});
    if (!matching) {
      throw new Error(`No ceremony_year found with ID ${ceremony_year_id}`);
    }
    return matching;
  }

}

