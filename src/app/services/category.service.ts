import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject, Subscriber} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError, filter, first, map} from 'rxjs/operators';
import * as _ from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {MyAuthService} from './auth/my-auth.service';
import {SystemVarsService} from './system.vars.service';
import {Person} from '../interfaces/Person';
import {VotesService} from './votes.service';
import {OddsService} from './odds.service';
import {SocketService} from './socket.service';
import {Winner} from '../interfaces/Winner';
import fast_sort from 'fast-sort';
import {DataService} from './data.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService implements OnDestroy {
  nomineesUrl = 'api/nominees';
  categoriesUrl = 'api/categories';
  cache: Category[];

  private _categories$ = new BehaviorSubject<Category[]>(undefined);
  private _dataStore: {categories: Category[]} = {categories: undefined};
  private _fetching = false;

  private _destroy$ = new Subject();

  private readonly winnerListeners: Subscriber<any>[];

  constructor(private http: HttpClient,
              private auth: MyAuthService,
              private systemVarsService: SystemVarsService,
              private votesService: VotesService,
              private oddsService: OddsService,
              private socket: SocketService,
              private dataService: DataService) {
    this.winnerListeners = [];
    this.systemVarsService.maybeRefreshCache();
  }

  // HELPERS

  private static addToArray<T>(existingArray: T[], newArray: T[]) {
    existingArray.push.apply(existingArray, newArray);
  }

  get categories(): Observable<Category[]> {
    return this.dataService.categories$;
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
    return this.getDataWithCacheUpdate<Category>(() => {
      return this.getCategoryFromCache(id);
    });
  }

  getCategoryCountNow(): number {
    return this._dataStore.categories.length;
  }

  private getCategoryFromCache(id: number): Category {
    return _.findWhere(this._dataStore.categories, {id: id});
  }

  // noinspection DuplicatedCode
  getNextCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this._dataStore.categories, {id: id});
      if (foundIndex === -1 || this._dataStore.categories.length < (foundIndex + 1)) {
        return null;
      }
      return this._dataStore.categories[foundIndex + 1];
    });
  }

  getPreviousCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this._dataStore.categories, {id: id});
      if (0 > (foundIndex - 1)) {
        return null;
      }
      return this._dataStore.categories[foundIndex - 1];
    });
  }

  getNominees(category_id: number): Observable<Nominee[]> {
    return this.getDataWithCacheUpdate<Nominee[]>(() => {
      const category = this.getCategoryFromCache(category_id);
      return category ? category.nominees : [];
    });
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

  private addWinnerToCache(winner: Winner, category: Category): void {
    const existingWinner = this.getWinnerForNominee(category, winner.nomination_id);
    if (!existingWinner) {
      category.winners.push(winner);
    }
  }

  private getWinnerForNominee(category: Category, nomination_id: number): Winner {
    return _.findWhere(category.winners, {nomination_id: nomination_id});
  }

  private removeWinnerFromCache(nomination_id: number): void {
    const category = this.getCategoryForNomination(nomination_id);
    const existingWinner = this.getWinnerForNominee(category, nomination_id);
    category.winners = _.without(category.winners, existingWinner);
  }

  private getCategoryForNomination(nomination_id: number): Category {
    return _.find(this._dataStore.categories, category => _.findWhere(category.nominees, {id: nomination_id}));
  }

  getCategoriesWithWinners(): Category[] {
    // noinspection TypeScriptValidateJSTypes
    return _.filter(this._dataStore.categories, category => category.winners.length > 0);
  }

  getMostRecentCategory(): Category {
    // noinspection TypeScriptValidateJSTypes
    const winners = _.flatten(_.map(this._dataStore.categories, category => category.winners));
    fast_sort(winners).desc([
        (winner: Winner) => winner.declared
      ]
    );
    if (winners.length > 0) {
      return this.getCategoryFromCache(winners[0].category_id);
    } else {
      return undefined;
    }
  }

  getNomineeFromCategory(category: Category, nomination_id: number) {
    return _.findWhere(category.nominees, {id: nomination_id});
  }

  getNomineeFromWinner(winner: Winner): Nominee {
    const category = this.getCategoryForNomination(winner.nomination_id);
    return this.getNomineeFromCategory(category, winner.nomination_id);
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


  // SCOREBOARD

  didPersonVoteCorrectlyFor(person: Person, category: Category): Observable<boolean> {
    return this.votesService.getVotesForCurrentYearAndCategory(category).pipe(
      map(votes => {
        const personVote = _.findWhere(votes, {person_id: person.id});
        if (!!personVote) {
          const winningIds = _.map(category.winners, winner => winner.nomination_id);
          return winningIds.includes(personVote.nomination_id);
        }
        return false;
      })
    );
  }

  populatePersonScores(persons: Person[]): Observable<any> {
    return new Observable<any>(observer => {
      this.categories.subscribe(categories => {
        this.populatePersonScoresForCategories(persons, categories).subscribe(() => observer.next());
      });
    });
  }

  populatePersonScoresForCategories(persons: Person[], categories: Category[]): Observable<any> {
    return new Observable<any>(observer => {
      this.votesService.getVotesForCurrentYear().subscribe(votes => {
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

  maxPosition(person: Person, persons: Person[]): number {
    const categoriesWithoutWinners = _.filter(this._dataStore.categories, category => !category.winners || category.winners.length === 0);
    const myVotes = _.map(categoriesWithoutWinners, category => {
      return this.votesService.getVotesForCurrentYearAndPersonAndCategory(person, category);
    });
    const finalScores = _.map(persons, otherPerson => {
      const theirVotes = this.votesService.getVotesForCurrentYearAndPerson(otherPerson);
      const theirVotesThatMatch = _.filter(theirVotes, vote => {
        const myVote = _.findWhere(myVotes, {category_id: vote.category_id});
        return !!myVote && myVote.nomination_id === vote.nomination_id;
      });
      const theirScore = _.reduce(theirVotesThatMatch, (memo, theirVote) => {
        const category = this.getCategoryFromCache(theirVote.category_id);
        return !!category ? memo + category.points : memo;
      }, 0);
      return {
        person_id: otherPerson.id,
        score: theirScore + otherPerson.score
      };
    });

    const myScore = _.findWhere(finalScores, {person_id: person.id});
    const scoresBetterThanMine = _.filter(finalScores, otherScore => otherScore.score > myScore.score);
    return scoresBetterThanMine.length + 1;
  }

  isEliminated(person: Person, persons: Person[]): boolean {
    return this.maxPosition(person, persons) > 1;
  }

  // LOADING

  stillLoading(): boolean {
    return this._fetching;
  }

  // MAX YEAR

  getMaxYear(): Observable<number> {
    return new Observable<number>(observer => {
      this.http.get('/api/maxYear')
        .pipe(
          catchError(this.handleError<any>('getMaxYear'))
        )
        .subscribe(maxYear => {
          observer.next(maxYear.maxYear);
        });
    });
  }

  // DATA HELPERS

  private getDataWithCacheUpdate<T>(getCallback): Observable<T> {
    return new Observable(observer => {
      this.categories.subscribe(
        () => observer.next(getCallback()),
        (err: Error) => observer.error(err)
      );
    });
  }

  resetWinners(): void {
    _.forEach(this._dataStore.categories, category => {
      category.winners = [];
    });
  }

  private updateWinnersInCacheAndNotify(msg) {
    const year = this.systemVarsService.getCurrentYear();
    if (this._dataStore.categories.length > 0 && !!year) {
      console.log(`Received winner message: ${JSON.stringify(msg)}`);
      if (msg.detail === 'reset') {
        this.resetWinners();
      } else {
        const category = this.getCategoryForNomination(msg.nomination_id);
        const winner: Winner = {
          id: msg.winner_id,
          category_id: category.id,
          nomination_id: msg.nomination_id,
          year: year,
          declared: new Date(msg.declared)
        };
        if (msg.detail === 'add') {
          this.addWinnerToCache(winner, category);
        } else if (msg.detail === 'delete') {
          this.removeWinnerFromCache(winner.nomination_id);
        }
      }
      this.updateWinnerSubscribers();
    }
  }

  private refreshCache(): void {
    this._dataStore.categories = [];
    // callback function doesn't have 'this' in scope.

    this.socket.removeListener('winner', this.updateWinnersInCacheAndNotify.bind(this));
    this.auth.me$
      .pipe(first())
      .subscribe(person => {
        if (!!person) {
          this.systemVarsService.systemVars
            .pipe(first())
            .subscribe(systemVars => {
              const options = {
                params: {
                  person_id: person.id.toString(),
                  year: systemVars.curr_year.toString()
                }
              };
              this.http.get<Category[]>(this.categoriesUrl, options)
                .pipe(
                  catchError(this.handleError<Category[]>('getCategories', [])),
                  first()
                )
                .subscribe(
                  (categories: Category[]) => {
                    _.forEach(categories, category => {
                      _.forEach(category.winners, winner => winner.declared = new Date(winner.declared));
                    });
                    this._dataStore.categories.length = 0;
                    CategoryService.addToArray(this._dataStore.categories, categories);
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
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
