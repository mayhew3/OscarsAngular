import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {combineLatest, Observable} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError, filter, map, tap} from 'rxjs/operators';
import * as _ from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {SystemVarsService} from './system.vars.service';
import {OddsService} from './odds.service';
import {SocketService} from './socket.service';
import {Winner} from '../interfaces/Winner';
import {PersonService} from './person.service';
import {Store} from '@ngxs/store';
import {GetCategories, OddsChange, UpdateOdds} from '../actions/category.action';
import {GetMaxYear} from '../actions/maxYear.action';
import {MaxYear} from '../interfaces/MaxYear';
import {ConnectednessService} from './connectedness.service';
import {ErrorNotificationService} from './error-notification.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  static singleLineCategories = ['Best Picture', 'Documentary Feature', 'Documentary Short', 'Short Film (Animated)',
    'Short Film (Live Action)', 'Animated Feature'];
  static songCategories = ['Music (Original Song)'];

  categories: Observable<Category[]> = this.store.select(state => state.categories).pipe(
    map(categories => categories.categories),
    filter(categories => !!categories),
    tap(() => {
      this.fetching = false;
    })
  );

  maxYear: Observable<MaxYear> = this.store.select(state => state.maxYear).pipe(
    map(state => state.maxYear),
    filter(maxYear => !!maxYear)
  );

  private fetching = false;

  constructor(private http: HttpClient,
              private personService: PersonService,
              private systemVarsService: SystemVarsService,
              private oddsService: OddsService,
              private socket: SocketService,
              private store: Store,
              private connectednessService: ConnectednessService,
              private errorHandler: ErrorNotificationService) {

    combineLatest([this.personService.me$, this.systemVarsService.systemVars])
      .subscribe(([me, systemVars]) => {
        this.store.dispatch(new GetCategories(systemVars.curr_year, me.id, this.socket)).pipe(
          catchError(this.errorHandler.handleAPIError())
        ).subscribe();
      });

    this.connectednessService.connectedToAll$.subscribe(([isAuthenticated, isConnected]) => {
      if (isAuthenticated && isConnected) {
        this.store.dispatch(new GetMaxYear());
      }
    });
  }

  static isSingleLineCategory(categoryName: string): boolean {
    return CategoryService.singleLineCategories.includes(categoryName);
  }

  static isSongCategory(categoryName: string): boolean {
    return CategoryService.songCategories.includes(categoryName);
  }

  static getSubtitleText(category: Category, nominee: Nominee): string {
    if (CategoryService.isSingleLineCategory(category.name)) {
      return undefined;
    } else if (nominee.nominee === nominee.context) {
      return nominee.detail;
    } else {
      return nominee.context;
    }
  }

  // REAL METHODS
  getCategory(id: number): Observable<Category> {
    return this.categories.pipe(
      map(categories => _.findWhere(categories, {id}))
    );
  }

  getCategoryCount(): Observable<number> {
    return this.categories.pipe(
      map(categories => categories.length)
    );
  }

  // noinspection DuplicatedCode
  getNextCategory(id: number): Observable<Category> {
    return this.categories.pipe(
      map(categories => {
        const foundIndex = _.findIndex(categories, {id});
        if (foundIndex === -1 || categories.length < (foundIndex + 1)) {
          return null;
        }
        return categories[foundIndex + 1];
      })
    );
  }

  getPreviousCategory(id: number): Observable<Category> {
    return this.categories.pipe(
      map(categories => {
        const foundIndex = _.findIndex(categories, {id});
        if (0 > (foundIndex - 1)) {
          return null;
        }
        return categories[foundIndex - 1];
      })
    );
  }

  getNominees(category_id: number): Observable<Nominee[]> {
    return this.getCategory(category_id).pipe(
      map(category => !!category ? category.nominees : [])
    );
  }

  updateOddsForNominees(changes: OddsChange[]): Observable<any> {
    return this.store.dispatch(new UpdateOdds(changes));
  }

  getCategoriesWithWinners(): Observable<Category[]> {
    return this.categories.pipe(
      map(categories => _.filter(categories, category => category.winners.length > 0))
    );
  }

  getMostRecentCategory(): Observable<Category> {
    return this.categories.pipe(
      map(categories => _.max(categories, (category: Category) => {
        const maxWinner = _.max(category.winners, winner => winner.declared) as Winner;
        return !!maxWinner ? maxWinner.declared : null;
      }) as Category)
    );
  }

  getNomineeFromCategory(category: Category, nomination_id: number): Nominee {
    return _.findWhere(category.nominees, {id: nomination_id});
  }

  getNomineeFromWinner(winner: Winner): Observable<Nominee> {
    return this.getCategoryForNomination(winner.nomination_id).pipe(
      map(category => this.getNomineeFromCategory(category, winner.nomination_id))
    );
  }

  // CATEGORY LIST FORMATTING

  getCategoryName(category: Category): string {
    const parts = category.name.split(' (');
    return parts[0];
  }

  getCategorySubtitle(category: Category): string {
    const parts = category.name.split(' (');
    if (parts.length > 1) {
      return parts[1].replace(')', '');
    } else {
      return undefined;
    }
  }


  // LOADING

  stillLoading(): boolean {
    return this.fetching;
  }

  // MAX YEAR

  getMaxYear(): Observable<number> {
    return this.maxYear.pipe(
      map(maxYear => maxYear.maxYear)
    );
  }

  // DATA HELPERS

  resetWinners(): Observable<void> {
    return this.categories.pipe(
      map(categories => {
        _.forEach(categories, category => {
          category.winners = [];
        });
      })
    );
  }

  // noinspection JSMethodCanBeStatic
  getWinnerForNominee(category: Category, nomination_id: number): Winner {
    return _.findWhere(category.winners, {nomination_id});
  }

  addWinner(category: Category, winner: Winner): void {
    const existingWinner = this.getWinnerForNominee(category, winner.nomination_id);
    if (!existingWinner) {
      category.winners[winner.id] = winner;
    }
  }

  removeWinner(category: Category, nomination_id: number): void {
    const winner = this.getWinnerForNominee(category, nomination_id);
    delete category.winners[winner.id];
  }

  private getCategoryForNomination(nomination_id: number): Observable<Category> {
    return this.categories.pipe(
      map(categories => _.find(categories, category => !!_.findWhere(category.nominees, {id: nomination_id})))
    );
  }

}
