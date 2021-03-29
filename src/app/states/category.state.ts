import {Category} from '../interfaces/Category';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {GetCategories} from '../actions/category.action';
import {Injectable} from '@angular/core';
import * as _ from 'underscore';

export class CategoryStateModel {
  categories: Category[];
}

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
}

