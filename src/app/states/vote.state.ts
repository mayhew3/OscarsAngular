import {Vote} from '../interfaces/Vote';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AddVote, ChangeVote, GetVotes} from '../actions/votes.action';
import {Injectable} from '@angular/core';
import {Winner} from '../interfaces/Winner';
import produce from 'immer';
import * as _ from 'underscore';
import {CategoryStateModel} from './category.state';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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

  constructor(private http: HttpClient) {
  }

  @Action(GetVotes)
  getVotes({getState, setState}: StateContext<VoteStateModel>, action: GetVotes): Observable<any> {
    const params = new HttpParams()
      .set('year', action.year.toString());
    return this.http.get<any[]>('/api/votes', {params}).pipe(
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
  addVote({getState, setState}: StateContext<VoteStateModel>, action: AddVote): Observable<any> {
    const data = {
      category_id: action.category_id,
      year: action.year,
      person_id: action.person_id,
      nomination_id: action.nomination_id,
      submitted: action.submitted
    };
    return this.http.post<Vote>('/api/votes', data, httpOptions).pipe(
      tap(result => {
        setState(
          produce(draft => {
            draft.votes.push(result);
          })
        );
      })
    );
  }

  @Action(ChangeVote)
  changeVote({getState, setState}: StateContext<VoteStateModel>, action: ChangeVote): Observable<any> {
    const data = {
      category_id: action.category_id,
      year: action.year,
      person_id: action.person_id,
      nomination_id: action.nomination_id,
      submitted: action.submitted
    };
    return this.http.post<Vote>('/api/votes', data, httpOptions).pipe(
      tap(() => {
        setState(
          produce(draft => {
            const existing = _.findWhere(draft.votes,
              {
                category_id: action.category_id,
                person_id: action.person_id,
                year: action.year
              });
            existing.nomination_id = action.nomination_id;
          })
        );
      })
    );
  }

}

