import {Vote} from '../interfaces/Vote';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpParams} from '@angular/common/http';
import {AddVote, ChangeVote, GetVotes} from '../actions/votes.action';
import {Injectable} from '@angular/core';
import produce from 'immer';
import * as _ from 'underscore';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';

export class VoteStateModel {
  votes: Vote[];
}

@State<VoteStateModel>({
  name: 'votes',
  defaults: {
    votes: undefined
  }
})
@Injectable()
export class VoteState {
  stateChanges = 0;

  constructor(private api: ApiService,
              private logger: LoggerService) {
  }

  @Action(GetVotes)
  async getVotes({setState}: StateContext<VoteStateModel>, action: GetVotes): Promise<any> {
    const params = new HttpParams()
      .set('year', action.year.toString());
    const result = await this.api.getAfterFullyConnected<Vote[]>('/api/votes', params);
    setState(
      produce( draft => {
        draft.votes = result;
        _.each(draft.votes, vote => vote.date_added = new Date(vote.date_added));
      })
    );
    this.stateChanges++;
    this.logger.log('VOTES State Change #' + this.stateChanges);
  }


  @Action(AddVote)
  addVote({setState}: StateContext<VoteStateModel>, action: AddVote): void {
    const data: Vote = {
      id: action.vote_id,
      category_id: action.category_id,
      year: action.year,
      person_id: action.person_id,
      nomination_id: action.nomination_id,
      date_added: new Date()
    };
    setState(
      produce(draft => {
        draft.votes.push(data);
      })
    );
  }

  @Action(ChangeVote)
  changeVote({setState}: StateContext<VoteStateModel>, action: ChangeVote): void {
    setState(
      produce(draft => {
        const existing: Vote = _.findWhere(draft.votes,
          {
            id: action.vote_id,
          });
        existing.nomination_id = action.nomination_id;
      })
    );
  }

}

