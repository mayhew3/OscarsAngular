import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FinalResult} from '../interfaces/FinalResult';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import * as _ from 'underscore';
import {Store} from '@ngxs/store';
import {GetFinalResults} from '../actions/final-result.action';
import {ConnectednessService} from './connectedness.service';

@Injectable({
  providedIn: 'root'
})
export class FinalResultsService {

  finalResults$: Observable<FinalResult[]> = this.store.select(state => state.finalResults).pipe(
    filter(model => !!model),
    map(model => model.finalResults),
    filter(finalResults => !!finalResults)
  );

  constructor(private http: HttpClient,
              private store: Store,
              private connectednessService: ConnectednessService) {
    this.connectednessService.connectedToAll$.subscribe(([isAuthenticated, isConnected]) => {
      if (isAuthenticated && isConnected) {
        this.store.dispatch(new GetFinalResults());
      }
    });
  }

  public getFinalResultsForGroup(group_id: number): Observable<FinalResult[]> {
    return this.finalResults$.pipe(
      map(finalResults => _.where(finalResults, {group_id}))
    );
  }

}
