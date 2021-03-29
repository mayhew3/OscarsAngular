import {Vote} from '../interfaces/Vote';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {GetVotes} from '../actions/votes.action';
import {Injectable} from '@angular/core';

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
}

