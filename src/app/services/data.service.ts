import {Injectable, OnDestroy} from '@angular/core';
import {DataCache} from '../interfaces/DataCache';
import {Vote} from '../interfaces/Vote';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import * as _ from 'underscore';
import {SystemVars} from '../interfaces/SystemVars';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  caches: DataCache<any>[] = [];
  systemVars: DataCache<SystemVars>;
  votes: DataCache<Vote>;

  constructor(private http: HttpClient) {
    this.initDataCaches();
    this.refreshDataCaches();
  }

  private initDataCaches(): void {
    this.systemVars = this.addDataCache(new DataCache<SystemVars>(
      '/api/systemVars', this.http, new Subject<any>(),
      new Observable(),
      ((systemVarsObj: any) => systemVarsObj)
    ));
    this.votes = this.addDataCache(new DataCache<Vote>(
      '/api/votes', this.http, new Subject<any>(),
      this.systemVars.data.pipe(
        map(systemVars => {
          return new HttpParams()
        })
      ),
      ((voteObj: any) => voteObj)
    ));
  }

  private refreshDataCaches(): void {
    _.each(this.caches, cache => cache.maybeRefreshCache());
  }

  private addDataCache(dataCache: DataCache<any>): DataCache<any> {
    this.caches.push(dataCache);
    return dataCache;
  }

  ngOnDestroy(): void {
    _.each(caches, cache => cache.onDestroy());
  }
}
