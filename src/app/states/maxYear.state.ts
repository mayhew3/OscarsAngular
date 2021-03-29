import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {MaxYear} from '../interfaces/MaxYear';
import {GetMaxYear} from '../actions/maxYear.action';

export class MaxYearStateModel {
  maxYear: MaxYear;
}

@State<MaxYearStateModel>({
  name: 'maxYear',
  defaults: {
    maxYear: undefined
  }
})
@Injectable()
export class MaxYearState {
  constructor(private http: HttpClient) {
  }

  @Action(GetMaxYear, {cancelUncompleted: true})
  getMaxYear({getState, setState}: StateContext<MaxYearStateModel>): Observable<any> {
    return new Observable<any>(observer => {
      this.http.get<any[]>('/api/maxYear').subscribe(result => {
          const state = getState();
          setState({
            ...state,
            maxYear: result[0]
          });
          observer.next(result);
        }
      );
    });
  }
}

