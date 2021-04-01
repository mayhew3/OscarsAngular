import {Category} from '../interfaces/Category';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AddWinner, GetCategories, RemoveWinner, ResetWinners, UpdateOdds} from '../actions/category.action';
import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import {Winner} from '../interfaces/Winner';
import produce from 'immer';
import {ArrayUtil} from '../utility/ArrayUtil';
import {Nominee} from '../interfaces/Nominee';
import {WritableDraft} from 'immer/dist/types/types-external';
import {SocketService} from '../services/socket.service';

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
  listenersInitialized = false;

  constructor(private http: HttpClient) {
  }

  private static logMessage(channelName: string, msg: any): void {
    console.log(`Received ${channelName} message: ${JSON.stringify(msg)}`);
  }

  maybeInitListeners(ctx: StateContext<CategoryStateModel>, socket: SocketService): void {
    if (!this.listenersInitialized) {
      socket.on('add_winner', msg => {
        CategoryState.logMessage('add_winner', msg);
        ctx.dispatch(new AddWinner(msg.nomination_id, msg.winner_id, msg.declared));
      });

      socket.on('remove_winner', msg => {
        CategoryState.logMessage('remove_winner', msg);
        ctx.dispatch(new RemoveWinner(msg.winner_id));
      });

      socket.on('reset_winners', msg => {
        CategoryState.logMessage('reset_winners', msg);
        ctx.dispatch(new ResetWinners(msg.year));
      });

      this.listenersInitialized = true;
    }
  }

  @Action(GetCategories)
  getCategories(ctx: StateContext<CategoryStateModel>, action: GetCategories): Observable<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString())
      .set('year', action.year.toString());
    return this.http.get<any[]>('/api/categories', {params}).pipe(
      tap(result => {
        const state = ctx.getState();
        _.each(result, (category: Category) => {
          _.each(category.winners, winner => winner.declared = new Date(winner.declared));
        });
        ctx.setState({
          ...state,
          categories: result
        });
        this.stateChanges++;

        this.maybeInitListeners(ctx, action.socket);

        console.log('CATEGORIES State Change #' + this.stateChanges);
      })
    );
  }

  @Action(AddWinner)
  addWinner({getState, setState}: StateContext<CategoryStateModel>, action: AddWinner): void {
    setState(
      produce(draft => {
        const nomination: Nominee = this.findNomination(draft.categories, action.nomination_id);
        const category = _.findWhere(draft.categories, {id: nomination.category_id});
        const winner: Winner = {
          id: action.winner_id,
          category_id: category.id,
          nomination_id: action.nomination_id,
          year: nomination.year,
          declared: action.declared
        };
        category.winners.push(winner);
      })
    );
  }

  @Action(RemoveWinner)
  removeWinner({getState, setState}: StateContext<CategoryStateModel>, action: RemoveWinner): void {
    setState(
      produce(draft => {
        const winner: Winner = this.findWinner(draft.categories, action.winner_id);
        const category = _.findWhere(draft.categories, {id: winner.category_id});
        ArrayUtil.removeFromArray(category.winners, winner);
      })
    );
  }

  @Action(UpdateOdds)
  updateOdds({getState, setState}: StateContext<CategoryStateModel>, action: UpdateOdds): Observable<any> {
    return this.http.put('api/oddsChange', action, httpOptions).pipe(
      tap(() => {
        setState(
          produce(draft => {
            _.each(action.changes, change => {
              const nominee = this.findNomination(draft.categories, change.nomination_id);
              nominee.odds_expert = change.odds_expert;
              nominee.odds_user = change.odds_user;
              nominee.odds_numerator = change.odds_numerator;
              nominee.odds_denominator = change.odds_denominator;
            });
          })
        );
      })
    );
  }

  @Action(ResetWinners)
  resetWinners({getState, setState}: StateContext<CategoryStateModel>, action: ResetWinners): void {
    setState(
      produce(draft => {
        for (const category of draft.categories) {
          const winners = ArrayUtil.cloneArray(category.winners);
          for (const winner of winners) {
            if (winner.year === action.year) {
              ArrayUtil.removeFromArray(category.winners, winner);
            }
          }
        }
      })
    );
  }

  /* HELPER METHODS */

  private findNomination(categories: WritableDraft<Category[]>, nomination_id: number): Nominee {
    return _.chain(categories)
      .map(c => c.nominees)
      .flatten()
      .find(n => n.id === nomination_id)
      .value();
  }

  private findWinner(categories: WritableDraft<Category[]>, winner_id: number): Winner {
    return _.chain(categories)
      .map(c => c.winners)
      .flatten()
      .find(w => w.id === winner_id)
      .value();
  }

}

