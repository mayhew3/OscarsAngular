import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, Subscriber} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError} from 'rxjs/operators';
import {_} from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {AuthService} from './auth/auth.service';
import {SystemVarsService} from './system.vars.service';
import {Person} from '../interfaces/Person';
import {VotesService} from './votes.service';
import {OddsService} from './odds.service';
import {SocketService} from './socket.service';
import {Winner} from '../interfaces/Winner';
import fast_sort from 'fast-sort';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  nomineesUrl = 'api/nominees';
  categoriesUrl = 'api/categories';
  cache: Category[];
  private readonly winnerListeners: Subscriber<any>[];

  constructor(private http: HttpClient,
              private auth: AuthService,
              private systemVarsService: SystemVarsService,
              private votesService: VotesService,
              private oddsService: OddsService,
              private socket: SocketService) {
    this.cache = [];
    this.winnerListeners = [];
  }

  // HELPERS

  private static addToArray<T>(existingArray: T[], newArray: T[]) {
    existingArray.push.apply(existingArray, newArray);
  }

  // REAL METHODS

  getCategories(): Observable<Category[]> {
    return this.maybeUpdateCache();
  }

  getCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      return this.getCategoryFromCache(id);
    });
  }

  getCategoryCountNow(): number {
    return this.cache.length;
  }

  private getCategoryFromCache(id: number): Category {
    return _.findWhere(this.cache, {id: id});
  }

  // noinspection DuplicatedCode
  getNextCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this.cache, {id: id});
      if (foundIndex === -1 || this.cache.length < (foundIndex + 1)) {
        return null;
      }
      return this.cache[foundIndex + 1];
    });
  }

  getPreviousCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this.cache, {id: id});
      if (0 > (foundIndex - 1)) {
        return null;
      }
      return this.cache[foundIndex - 1];
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
    return _.find(this.cache, category => _.findWhere(category.nominees, {id: nomination_id}));
  }

  getCategoriesWithWinners(): Category[] {
    // noinspection TypeScriptValidateJSTypes
    return _.filter(this.cache, category => category.winners.length > 0);
  }

  getMostRecentCategory(): Category {
    // noinspection TypeScriptValidateJSTypes
    const winners = _.flatten(_.map(this.cache, category => category.winners));
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

  didPersonVoteCorrectlyFor(person: Person, category: Category): boolean {
    const votes = this.votesService.getVotesForCurrentYearAndCategory(category);
    const personVote = _.findWhere(votes, {person_id: person.id});
    if (!!personVote) {
      const winningIds = _.map(category.winners, winner => winner.nomination_id);
      return winningIds.includes(personVote.nomination_id);
    }
    return false;
  }

  populatePersonScores(persons: Person[]): Observable<any> {
    return new Observable<any>(observer => {
      this.maybeUpdateCache().subscribe(categories => {
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
    const categoriesWithoutWinners = _.filter(this.cache, category => !category.winners || category.winners.length === 0);
    const myVotes = _.map(categoriesWithoutWinners, category => {
      const myVotesForCategory = this.votesService.getVotesForCurrentYearAndPersonAndCategory(person, category);
      return myVotesForCategory.length === 0 ? undefined : myVotesForCategory[0];
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
    return this.cache.length === 0;
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
      this.maybeUpdateCache().subscribe(
        () => observer.next(getCallback()),
        (err: Error) => observer.error(err)
      );
    });
  }

  resetWinners(): void {
    _.forEach(this.cache, category => {
      category.winners = [];
    });
  }

  private maybeUpdateCache(): Observable<Category[]> {
    if (this.cache.length === 0) {
      return this.refreshCache();
    } else {
      return of(this.cache);
    }
  }

  refreshCache(): Observable<Category[]> {
    this.cache.length = 0;
    // callback function doesn't have 'this' in scope.
    const categoryServiceGlobal = this;
    const updateWinnersInCacheAndNotify = function(msg) {
      const year = categoryServiceGlobal.systemVarsService.getCurrentYear();
      if (categoryServiceGlobal.cache.length > 0 && !!year) {
        console.log(`Received winner message: ${JSON.stringify(msg)}`);
        if (msg.detail === 'reset') {
          categoryServiceGlobal.resetWinners();
        } else {
          const category = categoryServiceGlobal.getCategoryForNomination(msg.nomination_id);
          const winner: Winner = {
            id: msg.winner_id,
            category_id: category.id,
            nomination_id: msg.nomination_id,
            year: year,
            declared: new Date(msg.declared)
          };
          if (msg.detail === 'add') {
            categoryServiceGlobal.addWinnerToCache(winner, category);
          } else if (msg.detail === 'delete') {
            categoryServiceGlobal.removeWinnerFromCache(winner.nomination_id);
          }
        }
        categoryServiceGlobal.updateWinnerSubscribers();
      }
    };

    this.socket.removeListener('winner', updateWinnersInCacheAndNotify);
    return new Observable<Category[]>((observer) => {
      this.auth.getPerson().subscribe(person => {
        if (!person) {
          this.auth.logout();
        }
        this.systemVarsService.getSystemVars().subscribe(systemVars => {
          const options = {
            params: {
              person_id: person.id.toString(),
              year: systemVars.curr_year.toString()
            }};
          this.http.get<Category[]>(this.categoriesUrl, options)
            .pipe(
              catchError(this.handleError<Category[]>('getCategories', []))
            )
            .subscribe(
              (categories: Category[]) => {
                _.forEach(categories, category => {
                  _.forEach(category.winners, winner => winner.declared = new Date(winner.declared));
                });
                this.cache.length = 0;
                CategoryService.addToArray(this.cache, categories);
                this.socket.on('winner', updateWinnersInCacheAndNotify);
                observer.next(categories);
              },
              (err: Error) => observer.error(err)
            );
        });
      });
    });
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
