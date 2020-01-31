import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscriber} from 'rxjs';
import {OddsBundle} from '../interfaces/OddsBundle';
import {SocketService} from './socket.service';
import {_} from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class OddsService {
  private odds: OddsBundle;
  private previousOdds: OddsBundle;

  private readonly oddsChangedCallbacks: Subscriber<any>[];
  private loading = true;

  constructor(private http: HttpClient,
              private socket: SocketService) {
    this.oddsChangedCallbacks = [];
    const oddsServiceThis = this;
    const refreshNow = function() {
      oddsServiceThis.refreshCache().subscribe(() => {
        oddsServiceThis.updateOddsSubscribers();
      });
    };

    this.socket.removeListener('reconnect', refreshNow);
    this.refreshCache().subscribe(() => {
      this.socket.on('odds', msg => {
        this.odds = msg;
        this.updateOddsSubscribers();
      });
      // this.socket.on('reconnect', refreshNow);
    });
  }

  refreshCache(): Observable<any> {
    return new Observable<any>(observer => {
      this.loading = true;
      this.clearOdds();
      this.getOddsFromDatabase().subscribe(odds => {
        this.loading = false;
        this.odds = odds;
        this.updateOddsSubscribers();
        observer.next();
      });
    });
  }

  stillLoading(): boolean {
    return this.loading;
  }

  subscribeToOddsEvents(): Observable<any> {
    return new Observable<any>(observer => this.addOddsSubscriber(observer));
  }

  private addOddsSubscriber(subscriber: Subscriber<any>): void {
    this.oddsChangedCallbacks.push(subscriber);
  }

  updateOddsSubscribers(): void {
    _.forEach(this.oddsChangedCallbacks, callback => callback.next());
  }

  clearOdds(): void {
    this.previousOdds = this.odds;
    this.odds = undefined;
  }

  getOdds(): OddsBundle {
    return this.odds;
  }

  getPreviousOdds(): OddsBundle {
    return this.previousOdds;
  }

  getOddsFromDatabase(): Observable<OddsBundle> {
    return this.http.get<OddsBundle>('api/odds');
  }

}
