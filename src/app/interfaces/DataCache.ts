import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import * as _ from 'underscore';

export class DataCache<T> {
  private _dataSubject$ = new BehaviorSubject<T[]>(undefined);
  private _dataStore: {data: T[]} = {data: undefined};
  private _fetching = false;

  constructor(private apiUrl: string,
              private http: HttpClient,
              private destroy$: Subject<any>,
              private params: Observable<any>,
              private postProcess: (dataObj: any) => any) {
  }

  get data(): Observable<T[]> {
    return this._dataSubject$.asObservable().pipe(
      filter(data => !!data)
    );
  }

  maybeRefreshCache(): void {
    if (!this._dataStore.data && !this._fetching) {
      this._fetching = true;
      this.refreshCache();
    }
  }

  onDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  emptyCache(): void {
    this._dataStore.data = undefined;
    this._dataSubject$.next(undefined);
  }

  private refreshCache(): void {
    this.params.subscribe(params => {
      this.http
        .get<any[]>(this.apiUrl, {params})
        .pipe(takeUntil(this.destroy$))
        .subscribe(dataObjects => {
          this._dataStore.data = _.map(dataObjects, this.postProcess);
          this._fetching = false;
          this.pushListChangeToListeners();
        });
    });
  }

  private pushListChangeToListeners(): void {
    this._dataSubject$.next(this._dataStore.data);
  }
}
