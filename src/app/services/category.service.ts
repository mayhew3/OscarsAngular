import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable, of, Subject, Subscriber} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError, distinctUntilChanged, filter, map, mergeMap, tap} from 'rxjs/operators';
import * as _ from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {SystemVarsService} from './system.vars.service';
import {OddsService} from './odds.service';
import {SocketService} from './socket.service';
import {Winner} from '../interfaces/Winner';
import {PersonService} from './person.service';
import {ArrayUtil} from '../utility/ArrayUtil';
import {Store} from '@ngxs/store';
import {GetCategories} from '../actions/category.action';
import {GetMaxYear} from '../actions/maxYear.action';
import {MaxYear} from '../interfaces/MaxYear';
import {SystemVars} from '../interfaces/SystemVars';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService implements OnDestroy {

  static singleLineCategories = ['Best Picture', 'Documentary Feature', 'Documentary Short', 'Short Film (Animated)', 'Short Film (Live Action)', 'Animated Feature'];
  static songCategories = ['Music (Original Song)'];

  nomineesUrl = 'api/nominees';
  categoriesUrl = 'api/categories';
  cache: Category[];

  private _categories$ = new BehaviorSubject<Category[]>(undefined);
  private _dataStore: {categories: Category[]} = {categories: undefined};
  private _fetching = false;

  private _destroy$ = new Subject();

  private readonly winnerListeners: Subscriber<any>[];

  categories: Observable<Category[]> = this.store.select(state => state.categories).pipe(
    map(categories => categories.categories),
    filter(categories => !!categories),
    tap(() => {
      this._fetching = false;
    })
  );

  maxYear: Observable<MaxYear> = this.store.select(state => state.maxYear).pipe(
    map(state => state.maxYear),
    filter(maxYear => !!maxYear)
  );

  constructor(private http: HttpClient,
              private personService: PersonService,
              private systemVarsService: SystemVarsService,
              private oddsService: OddsService,
              private socket: SocketService,
              private store: Store) {
    this.winnerListeners = [];

    combineLatest([this.personService.me$, this.systemVarsService.systemVars])
      .subscribe(([me, systemVars]) => {
        this.store.dispatch(new GetCategories(systemVars.curr_year, me.id));
      });

    this.store.dispatch(new GetMaxYear());
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

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  maybeRefreshCache(): void {
    if (!this._dataStore.categories && !this._fetching) {
      this._fetching = true;
      this.refreshCache();
    }
  }

  emptyCache(): void {
    this._dataStore.categories = undefined;
    this._categories$.next(undefined);
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

  updateNominee(nominee: Nominee): Observable<any> {
    return this.http.put(this.nomineesUrl, nominee, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateCategories', nominee))
      );
  }

  subscribeToWinnerEvents(): Observable<any> {
    return new Observable<any>(observer => this.addWinnerSubscriber(observer));
  }

  private addWinnerSubscriber(subscriber: Subscriber<any>): void {
    this.winnerListeners.push(subscriber);
  }

  updateWinnerSubscribers(): void {
    this.oddsService.clearOdds();
    _.forEach(this.winnerListeners, listener => listener.next());
  }

  private removeWinnerFromCache(nomination_id: number): Observable<void> {
    return this.getCategoryForNomination(nomination_id).pipe(
      map(category => {
        this.removeWinner(category, nomination_id);
      })
    );
  }

  private getCategoryForNomination(nomination_id: number): Observable<Category> {
    return this.categories.pipe(
      map(categories => _.find(categories, category => !!_.findWhere(category.nominees, {id: nomination_id})))
    );
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


/*

  populatePersonScores(persons: Person[]): Observable<any> {
    return new Observable<any>(observer => {
      this.categories.subscribe(categories => {
        this.populatePersonScoresForCategories(persons, categories).subscribe(() => observer.next());
      });
    });
  }

  populatePersonScoresForCategories(persons: Person[], categories: Category[]): Observable<any> {
    return new Observable<any>(observer => {
      this.votesService.votes.subscribe(votes => {
        _.forEach(persons, person => {
          let score = 0;
          let numVotes = 0;
          _.forEach(categories, category => {
            const personVote = _.findWhere(votes, {
              person_id: person.id,
              category_id: category.id
            });
            if (personVote) {
              numVotes++;
              if (category.winners.length > 0) {
                const existingWinner = this.getWinnerForNominee(category, personVote.nomination_id);
                if (!!existingWinner) {
                  score += category.points;
                }
              }
            }
          });
          person.score = score;
          person.num_votes = numVotes;
        });
        observer.next();
      });
    });
  }
*/

  // LOADING

  stillLoading(): boolean {
    return this._fetching;
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

  private updateWinnersInCacheAndNotify(msg): Observable<void> {
    const year$ = this.systemVarsService.getCurrentYear();
    const category$ = this.getCategoryForNomination(msg.nomination_id);

    return combineLatest([year$, category$]).pipe(
      mergeMap(([year, category]) => {
        console.log(`Received winner message: ${JSON.stringify(msg)}`);
        const winner: Winner = {
          id: msg.winner_id,
          category_id: category.id,
          nomination_id: msg.nomination_id,
          year,
          declared: new Date(msg.declared)
        };
        return this.updateWinners(category, msg.detail, winner);
      }),
      map(() => this.updateWinnerSubscribers())
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

  private updateWinners(category: Category, operation: string, winner: Winner): Observable<void> {
    if (operation === 'reset') {
      return this.resetWinners();
    } else {
      if (operation === 'add') {
        return of(this.addWinner(category, winner));
      } else if (operation === 'delete') {
        return this.removeWinnerFromCache(winner.nomination_id);
      }
    }
  }

  private refreshCache(): void {
    this._dataStore.categories = [];
    // callback function doesn't have 'this' in scope.

    this.socket.removeListener('winner', this.updateWinnersInCacheAndNotify.bind(this));
    this.personService.me$
      .subscribe(person => {
        if (!!person) {
          this.systemVarsService.systemVars
            .pipe(distinctUntilChanged((sv1: SystemVars, sv2: SystemVars) => sv1.curr_year === sv2.curr_year))
            .subscribe(systemVars => {
              const options = {
                params: {
                  person_id: person.id.toString(),
                  year: systemVars.curr_year.toString()
                }
              };
              this.http.get<Category[]>(this.categoriesUrl, options)
                .pipe(
                  catchError(this.handleError<Category[]>('getCategories', []))
                )
                .subscribe(
                  (categories: Category[]) => {
                    _.forEach(categories, category => {
                      _.forEach(category.winners, winner => winner.declared = new Date(winner.declared));
                    });
                    this._dataStore.categories.length = 0;
                    ArrayUtil.addToArray(this._dataStore.categories, categories);
                    this.socket.on('winner', this.updateWinnersInCacheAndNotify.bind(this));
                    this._fetching = false;
                    this.pushListChange();
                  }
                );
            });
        }
      });
  }

  private pushListChange(): void {
    this._categories$.next(this._dataStore.categories);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T): (obs: Observable<T>) => Observable<T>  {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
