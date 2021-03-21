import {Injectable, OnDestroy} from '@angular/core';
import {DataCache} from '../interfaces/DataCache';
import {Vote} from '../interfaces/Vote';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import * as _ from 'underscore';
import {SystemVars} from '../interfaces/SystemVars';
import {first, map} from 'rxjs/operators';
import {Category} from '../interfaces/Category';
import {MyAuthService} from './auth/my-auth.service';
import {Person} from '../interfaces/Person';
import {Winner} from '../interfaces/Winner';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  private caches: DataCache<any>[] = [];
  private systemVars: DataCache<SystemVars>;
  private votes: DataCache<Vote>;
  private categories: DataCache<Category>;
  private persons: DataCache<Person>;

  constructor(private http: HttpClient,
              private auth: MyAuthService) {
    this.initDataCaches();
  }

  private initDataCaches(): void {

    this.persons = this.addDataCache(
      'persons',
      of(undefined),
      ((persons: Person[]) => of(persons))
    );

    this.systemVars = this.addDataCache(
      'systemVars',
      new BehaviorSubject(undefined).asObservable(),
      ((systemVarsObj: SystemVars[]) => of(systemVarsObj))
    );

    this.categories = this.addDataCache(
      'categories',
      this.categoryParams(),
      ((categories: Category[]) => {
        _.each(categories, (category: Category) => {
          _.each(category.winners, winner => winner.declared = new Date(winner.declared));
        });
        return of(categories);
      })
    );

    this.votes = this.addDataCache(
      'votes',
      this.voteParams(),
      ((votes: Vote[]) => {
        return combineLatest([this.persons.data, this.categories.data]).pipe(
          map(([persons, categories]) => {
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
            return votes;
          })
        );
      })
    );

  }

  get systemVars$(): Observable<SystemVars> {
    return this.systemVars.data[0];
  }

  get persons$(): Observable<Person[]> {
    return this.persons.data;
  }

  get categories$(): Observable<Category[]> {
    return this.categories.data;
  }

  get votes$(): Observable<Vote[]> {
    return this.votes.data;
  }

  private categoryParams(): Observable<any> {
    return combineLatest([this.systemVars.data, this.auth.me$.pipe(first())])
      .pipe(
        map(([systemVars, person]) => {
          return {
            person_id: person.id,
            year: systemVars[0].curr_year.toString()
          };
        })
      );
  }

  private voteParams() {
    return this.systemVars.data.pipe(
      map((systemVars: SystemVars[]) => {
        return new HttpParams().set('year', systemVars[0].curr_year.toString());
      })
    );
  }

  private refreshDataCaches(): void {
    _.each(this.caches, cache => cache.maybeRefreshCache());
  }

  private addDataCache<T>(apiBase: string,
                       params: Observable<any>,
                       postProcess: (dataObj: T[]) => Observable<T[]>): DataCache<any> {
    const dataCache = new DataCache<T>(`/api/${apiBase}`, this.http, new Subject<any>(), params, postProcess);
    this.caches.push(dataCache);
    return dataCache;
  }

  private getWinnerForNominee(category: Category, nomination_id: number): Winner {
    return _.findWhere(category.winners, {nomination_id: nomination_id});
  }

  ngOnDestroy(): void {
    _.each(caches, cache => cache.onDestroy());
  }
}
