import {Injectable, OnDestroy} from '@angular/core';
import {DataCache} from '../interfaces/DataCache';
import {Vote} from '../interfaces/Vote';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import * as _ from 'underscore';
import {SystemVars} from '../interfaces/SystemVars';
import {map} from 'rxjs/operators';
import {Category} from '../interfaces/Category';
import {MyAuthService} from './auth/my-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  caches: DataCache<any>[] = [];
  systemVars: DataCache<SystemVars>;
  votes: DataCache<Vote>;
  categories: DataCache<Category>;

  constructor(private http: HttpClient,
              private auth: MyAuthService) {
    this.initDataCaches();
    this.refreshDataCaches();
  }

  private initDataCaches(): void {

    this.systemVars = this.addDataCache(
      'systemVars',
      new BehaviorSubject(undefined).asObservable(),
      ((systemVarsObj: any) => systemVarsObj)
    );

    this.votes = this.addDataCache(
      'votes',
      this.voteParams(),
      ((voteObj: any) => voteObj)
    );

    this.categories = this.addDataCache(
      'categories',
      this.categoryParams(),
      ((categoryObj: any) => categoryObj)
    );

  }

  private categoryParams() {
    return combineLatest([this.systemVars.data, this.auth.me$]).pipe(
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
