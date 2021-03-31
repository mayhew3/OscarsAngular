import {Category} from '../interfaces/Category';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AddWinner, GetCategories, RemoveWinner} from '../actions/category.action';
import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import {Winner} from '../interfaces/Winner';
import produce from 'immer';
import {ArrayUtil} from '../utility/ArrayUtil';

export class CategoryStateModel {
  categories: Category[];
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@State<CategoryStateModel>({
  name: 'categories',
  defaults: {
    categories: undefined
  }
})
@Injectable()
export class CategoryState {
  stateChanges = 0;

  constructor(private http: HttpClient) {
  }

  @Action(GetCategories)
  getCategories({getState, setState}: StateContext<CategoryStateModel>, action: GetCategories): Observable<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString())
      .set('year', action.year.toString());
    return this.http.get<any[]>('/api/categories', {params}).pipe(
      tap(result => {
        const state = getState();
        _.each(result, (category: Category) => {
          _.each(category.winners, winner => winner.declared = new Date(winner.declared));
        });
        setState({
          ...state,
          categories: result
        });
        this.stateChanges++;
        console.log('CATEGORIES State Change #' + this.stateChanges);
      })
    );
  }

  @Action(AddWinner)
  addWinner({getState, setState}: StateContext<CategoryStateModel>, action: AddWinner): Observable<any> {
    return this.http.post<Winner>('/api/winners', action, httpOptions).pipe(
      tap(result => {
        setState(
          produce(draft => {
            const category = _.find(draft.categories, c => c.id === action.category_id);
            result.declared = new Date(result.declared);
            category.winners.push(result);
          })
        );
      })
    );
  }

  @Action(RemoveWinner)
  removeWinner({getState, setState}: StateContext<CategoryStateModel>, action: RemoveWinner): Observable<any> {
    return this.http.delete<Winner>(`/api/winners/${action.winner_id}`, httpOptions).pipe(
      tap(() => {
        setState(
          produce(draft => {
            const category = _.find(draft.categories, c => c.id === action.category_id);
            const winner = _.findWhere(category.winners, {id: action.winner_id});
            ArrayUtil.removeFromArray(category.winners, winner);
          })
        );
      })
    );
  }

}

