import {Category} from '../interfaces/Category';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
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
  constructor(private http: HttpClient) {
  }

  @Action(GetCategories, {cancelUncompleted: true})
  getCategories({getState, setState}: StateContext<CategoryStateModel>, action: GetCategories): Observable<any> {
    return new Observable<any>(observer => {
      const params = new HttpParams()
        .set('person_id', action.person_id.toString())
        .set('year', action.year.toString());
      this.http.get<any[]>('/api/categories', {params}).subscribe(result => {
        const state = getState();
        _.each(result, (category: Category) => {
          _.each(category.winners, winner => winner.declared = new Date(winner.declared));
        });
        setState({
          ...state,
          categories: result
        });
        observer.next(undefined);
      });
    });
  }
}

