import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, first, takeUntil, tap} from 'rxjs/operators';
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
              private postProcess: (dataObj: T) => T) {
  }

  get data(): Observable<T[]> {
    return this._dataSubject$.asObservable().pipe(
      tap(() => this.maybeRefreshCache()),
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
    this.params
      .subscribe(this.runHttpMethod.bind(this));
  }

  private runHttpMethod(params: any): void {
    this.http
      .get<any[]>(this.apiUrl, {params})
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.updateData.bind(this));
  }

  private updateData(dataObjects: T[]): void {
    this._dataStore.data = _.map(dataObjects, this.postProcess);
    this._fetching = false;
    this.pushListChangeToListeners();
  }

  private pushListChangeToListeners(): void {
    this._dataSubject$.next(this._dataStore.data);
  }
}
