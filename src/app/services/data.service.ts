import {Injectable, OnDestroy} from '@angular/core';
import {DataCache} from '../interfaces/DataCache';
import {Vote} from '../interfaces/Vote';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import * as _ from 'underscore';
import {SystemVars} from '../interfaces/SystemVars';
import {first, map} from 'rxjs/operators';
import {Category} from '../interfaces/Category';
import {MyAuthService} from './auth/my-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  private caches: DataCache<any>[] = [];
  private systemVars: DataCache<SystemVars>;
  private votes: DataCache<Vote>;
  private categories: DataCache<Category>;

  constructor(private http: HttpClient,
              private auth: MyAuthService) {
    this.initDataCaches();
  }

  private initDataCaches(): void {

    this.systemVars = this.addDataCache(
      'systemVars',
      new BehaviorSubject(undefined).asObservable(),
      ((systemVarsObj: SystemVars) => systemVarsObj)
    );

    this.votes = this.addDataCache(
      'votes',
      this.voteParams(),
      ((voteObj: Vote) => voteObj)
    );

    this.categories = this.addDataCache(
      'categories',
      this.categoryParams(),
      ((categoryObj: Category) => {
        _.each(categoryObj.winners, winner => winner.declared = new Date(winner.declared));
        return categoryObj;
      })
    );

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

  private addDataCache(apiBase: string,
                       params: Observable<any>,
                       postProcess: (dataObj: any) => any): DataCache<any> {
    const dataCache = new DataCache(`/api/${apiBase}`, this.http, new Subject<any>(), params, postProcess);
    this.caches.push(dataCache);
    return dataCache;
  }

  ngOnDestroy(): void {
    _.each(caches, cache => cache.onDestroy());
  }
}
