import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
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
  stateChanges = 0;

  constructor(private http: HttpClient) {
  }

  @Action(GetMaxYear)
  getMaxYear({getState, setState}: StateContext<MaxYearStateModel>): Observable<any> {
    return this.http.get<any[]>('/api/maxYear').pipe(
      tap(result => {
        const state = getState();
        setState({
          ...state,
          maxYear: result[0]
        });
        this.stateChanges++;
        console.log('MAXYEAR State Change #' + this.stateChanges);
      })
    );
  }
}

