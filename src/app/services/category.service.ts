import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, Subscriber, Subscription, timer} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError, tap} from 'rxjs/operators';
import {_} from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {AuthService} from './auth/auth.service';
import {SystemVarsService} from './system.vars.service';
import {Person} from '../interfaces/Person';
import {VotesService} from './votes.service';
import {EventsService} from './events.service';
import {OddsService} from './odds.service';
import {Socket} from 'ngx-socket-io';

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
  /*
  private winnersLastUpdate: Date;
  private eventSubscription: Subscription;
  */
  private readonly winnerListeners: Subscriber<any>[];

  constructor(private http: HttpClient,
              private auth: AuthService,
              private systemVarsService: SystemVarsService,
              private votesService: VotesService,
              private eventsService: EventsService,
              private oddsService: OddsService,
              private socket: Socket) {
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

  private getCategoryFromCache(id: number): Category {
    return _.findWhere(this.cache, {id: id});
  }

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
        tap(() => console.log('did some tapping')),
        catchError(this.handleError<any>('updateCategories', nominee))
      );
  }

  doEventsUpdate(): void {
    /*
          this.eventsService.getEvents(this.winnersLastUpdate).subscribe(events => {
            _.forEach(events, event => {
              if (event.type === 'votes_locked') {
                if (event.detail === 'locked') {
                  this.systemVarsService.lockVotingInternal();
                } else if (event.detail === 'unlocked') {
                  this.systemVarsService.unlockVotingInternal();
                }
              }
            });
            this.winnersLastUpdate = updateTime;
          });*/
  }

  subscribeToWinnerEvents(): Observable<any> {
    return new Observable<any>(observer => this.addWinnerSubscriber(observer));
  }

  addWinnerSubscriber(subscriber: Subscriber<any>): void {
    this.winnerListeners.push(subscriber);
  }

  updateWinnerSubscribers(msg): void {
    this.oddsService.clearOdds();
    _.forEach(this.winnerListeners, listener => listener.next(msg));
  }

  private addWinnerToCache(nomination_id: number, category: Category): void {
    if (!category.winners.includes(nomination_id)) {
      category.winners.push(nomination_id);
    }
  }

  private removeWinnerFromCache(nomination_id: number): void {
    const category = this.getCategoryForNomination(nomination_id);
    category.winners = _.without(category.winners, nomination_id);
  }

  private getCategoryForNomination(nomination_id: number): Category {
    return _.find(this.cache, category => _.findWhere(category.nominees, {id: nomination_id}));
  }

  // SCOREBOARD

  populatePersonScores(persons: Person[]) {
    this.maybeUpdateCache().subscribe(categories => {
      this.populatePersonScoresForCategories(persons, categories);
    });
  }

  populatePersonScoresForCategories(persons: Person[], categories: Category[]) {
    this.votesService.getVotesForCurrentYear().subscribe(votes => {
      _.forEach(persons, person => {
        let score = 0;
        let numVotes = 0;
        _.forEach(categories, category => {
          const winners = category.winners;
          const personVote = _.findWhere(votes, {
            person_id: person.id,
            category_id: category.id
          });
          if (personVote) {
            numVotes++;
            if (winners.includes(personVote.nomination_id)) {
              score += category.points;
            }
          }
        });
        person.score = score;
        person.num_votes = numVotes;
      });
    });
  }

  // LOADING

  stillLoading(): boolean {
    return this.cache.length === 0;
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

  private maybeUpdateCache(): Observable<Category[]> {
    // callback function doesn't have 'this' in scope.
    const categoryServiceGlobal = this;
    const updateWinnersInCacheAndNotify = function(msg) {
      if (categoryServiceGlobal.cache.length > 0) {
        console.log(`Received winner message: ${JSON.stringify(msg)}`);
        const category = categoryServiceGlobal.getCategoryForNomination(msg.nomination_id);
        if (msg.detail === 'add') {
          categoryServiceGlobal.addWinnerToCache(msg.nomination_id, category);
        } else if (msg.detail === 'delete') {
          categoryServiceGlobal.removeWinnerFromCache(msg.nomination_id);
        }
        categoryServiceGlobal.updateWinnerSubscribers(msg);
      }
    };

    if (this.cache.length === 0) {
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
                  CategoryService.addToArray(this.cache, categories);
                  this.socket.on('winner', updateWinnersInCacheAndNotify);
                  observer.next(categories);
                },
                (err: Error) => observer.error(err)
              );
          });
        });
      });
    } else {
      return of(this.cache);
    }
  }



  private addToWinnersArray(category: Category, index: string, nomination_id: number) {
    if (!category.winners) {
      category.winners = [];
    }
    if (!category.winners[index]) {
      category.winners[index] = [];
    }
    category.winners[index].push(nomination_id);
  }

  private extractWinnersFromCategory(category: Category, year: string): number[] {
    if (!category.winners) {
      return [];
    } else {
      return category.winners;
    }
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
