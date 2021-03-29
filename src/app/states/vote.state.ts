import {Vote} from '../interfaces/Vote';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
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
  constructor(private http: HttpClient) {
  }

  @Action(GetVotes, {cancelUncompleted: true})
  getVotes({getState, setState}: StateContext<VoteStateModel>, action: GetVotes): Observable<any> {
    return new Observable<any>(observer => {
      const params = new HttpParams()
        .set('year', action.year.toString());
      this.http.get<any[]>('/api/votes', {params}).subscribe(result => {
          const state = getState();
          setState({
            ...state,
            votes: result
          });
          observer.next(result);
        }
      );
    });
  }
}

