import {Vote} from '../interfaces/Vote';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AddVote, ChangeVote, GetVotes} from '../actions/votes.action';
import {Injectable} from '@angular/core';
import produce from 'immer';
import * as _ from 'underscore';
import {ApiService} from '../services/api.service';

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

  constructor(private api: ApiService) {
  }

  @Action(GetVotes)
  getVotes({getState, setState}: StateContext<VoteStateModel>, action: GetVotes): Observable<any> {
    const params = new HttpParams()
      .set('year', action.year.toString());
    return this.api.getAfterFullyConnected<any[]>('/api/votes', params).pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          votes: result
        });
        this.stateChanges++;
        console.log('VOTES State Change #' + this.stateChanges);
      })
    );
  }


  @Action(AddVote)
  addVote({getState, setState}: StateContext<VoteStateModel>, action: AddVote): void {
    const data: Vote = {
      id: action.vote_id,
      category_id: action.category_id,
      year: action.year,
      person_id: action.person_id,
      nomination_id: action.nomination_id,
    };
    setState(
      produce(draft => {
        draft.votes.push(data);
      })
    );
  }

  @Action(ChangeVote)
  changeVote({getState, setState}: StateContext<VoteStateModel>, action: ChangeVote): void {
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

