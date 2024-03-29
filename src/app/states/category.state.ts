import {Category} from '../interfaces/Category';
import {Action, State, StateContext} from '@ngxs/store';
import {HttpParams} from '@angular/common/http';
import {AddWinner, GetCategories, RemoveWinner, ResetWinners, UpdateOdds} from '../actions/category.action';
import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import {Winner} from '../interfaces/Winner';
import produce from 'immer';
import {ArrayUtil} from '../utility/ArrayUtil';
import {Nominee} from '../interfaces/Nominee';
import {WritableDraft} from 'immer/dist/types/types-external';
import {ApiService} from '../services/api.service';
import {LoggerService} from '../services/logger.service';

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

  constructor(private api: ApiService,
              private logger: LoggerService) {
  }

  @Action(GetCategories)
  async getCategories({getState, setState}: StateContext<CategoryStateModel>, action: GetCategories): Promise<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString())
      .set('year', action.year.toString())
      .set('ceremony_name', action.ceremony_name);
    const result = await this.api.getAfterFullyConnected<Category[]>('/api/categories', params);
    const state = getState();
    _.each(result, (category: Category) => {
      _.each(category.winners, winner => winner.declared = new Date(winner.declared));
    });
    setState({
      ...state,
      categories: result
    });
    this.stateChanges++;

    this.logger.log('CATEGORIES State Change #' + this.stateChanges);
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
  async updateOdds({getState, setState}: StateContext<CategoryStateModel>, action: UpdateOdds): Promise<any> {
    await this.api.putAfterFullyConnected('/api/oddsChange', action);
    setState(
      produce(draft => {
        _.each(action.changes, change => {
          const nominee = this.findNomination(draft.categories, change.nomination_id);
          nominee.odds_expert = change.odds_expert;
          nominee.odds_user = change.odds_user;
          nominee.odds_moneyline = change.odds_moneyline;
          nominee.odds_numerator = change.odds_numerator;
          nominee.odds_denominator = change.odds_denominator;
        });
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

