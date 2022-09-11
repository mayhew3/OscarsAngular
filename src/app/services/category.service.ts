import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {Category} from '../interfaces/Category';
import {filter, map, mergeMap} from 'rxjs/operators';
import * as _ from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {Winner} from '../interfaces/Winner';
import {PersonService} from './person.service';
import {Store} from '@ngxs/store';
import {GetCategories, OddsChange, UpdateOdds} from '../actions/category.action';
import {GetMaxYear} from '../actions/maxYear.action';
import {MaxYear} from '../interfaces/MaxYear';
import {ArrayUtil} from '../utility/ArrayUtil';
import fast_sort from 'fast-sort';
import {CeremonyService} from './ceremony.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  static singleLineCategories = ['Best Picture', 'Documentary Feature', 'Documentary Short', 'Short Film (Animated)',
    'Short Film (Live Action)', 'Animated Feature'];
  static songCategories = ['Music (Original Song)'];
  static titleCategories = ['Writing', 'Directing'];

  categories: Observable<Category[]> = this.store.select(state => state.categories).pipe(
    map(model => model.categories),
    filter(Boolean),
    mergeMap(categories =>
      this.ceremonyService.getCurrentYear().pipe(
        map(year => _.filter(categories, category => category.nominees.length > 0 &&
          CategoryService.isInRange(year, category)))
      )),
    filter(Boolean)
  );

  maxYear: Observable<MaxYear> = this.store.select(state => state.maxYear).pipe(
    map(state => state.maxYear),
    filter(maxYear => !!maxYear)
  );

  constructor(private personService: PersonService,
              private ceremonyService: CeremonyService,
              private store: Store) {

    combineLatest([this.personService.me$, this.ceremonyService.getCurrentYear(), this.ceremonyService.getCurrentCeremonyName()])
      .subscribe(([me, year, ceremonyName]) => {
        this.store.dispatch(new GetCategories(year, me.id, ceremonyName));
      });

    this.store.dispatch(new GetMaxYear());
  }

  static isSingleLineCategory(categoryName: string): boolean {
    return CategoryService.singleLineCategories.includes(categoryName);
  }

  static isSongCategory(categoryName: string): boolean {
    return CategoryService.songCategories.includes(categoryName);
  }

  static isTitleCategory(categoryName: string): boolean {
    return CategoryService.titleCategories.includes(categoryName);
  }

  getSubtitleText(category: Category, nominee: Nominee): Observable<string> {
    return this.ceremonyService.getCurrentCeremonyName().pipe(
      map(currentCeremonyName => {
        if (CategoryService.isSingleLineCategory(category.name)) {
          return undefined;
        } else if (CategoryService.isTitleCategory(category.name) && currentCeremonyName === 'Oscars') {
          return !!nominee.detail ? `"${nominee.detail}"` : null;
        } else if (!CategoryService.isSongCategory(category.name) &&
          nominee.nominee === nominee.context || !nominee.context) {
          return nominee.detail;
        } else {
          return nominee.context;
        }
      })
    );
  }

  static isInRange(year: number, category: Category): boolean {
    const withinStart = !category.start_year || category.start_year <= year;
    const withinEnd = !category.end_year || category.end_year > year;
    return withinStart && withinEnd;
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

  getWinnerCategoryCount(): Observable<number> {
    return this.getCategoriesWithWinners().pipe(
      map(categories => categories.length)
    );
  }

  itsOver(): Observable<boolean> {
    const winnerCategoryCount$ = this.getWinnerCategoryCount();
    const totalCategoryCount$ = this.getCategoryCount();
    return combineLatest([winnerCategoryCount$, totalCategoryCount$]).pipe(
      map(([winnerCategoryCount, totalCategoryCount]) => {
        return winnerCategoryCount === totalCategoryCount;
      })
    );
  }

  get categoriesSorted$(): Observable<Category[]> {
    return this.categories.pipe(
      map(categories => {
          const sorted = ArrayUtil.cloneArray(categories);
          fast_sort(sorted)
            .by([
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
              {desc: category => this.mostRecentWinDate(category)},
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
              {asc: category => category.points},
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
              {asc: category => category.name}
            ]);
          return sorted;
        }
      ));
  }

  mostRecentWinDate(category: Category): Date {
    return category.winners.length > 0 ?
      _.max(_.map(category.winners, winner => winner.declared)) :
      undefined;
  }

  // noinspection DuplicatedCode
  getNextCategory(id: number): Observable<Category> {
    return this.categoriesSorted$.pipe(
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
    return this.categoriesSorted$.pipe(
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
    if (!!category.sub_name) {
      return category.sub_name;
    }
    const parts = category.name.split(' (');
    if (parts.length > 1) {
      return parts[1].replace(')', '');
    } else {
      return undefined;
    }
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
