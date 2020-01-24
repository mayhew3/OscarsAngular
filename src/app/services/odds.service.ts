import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscription, timer} from 'rxjs';
import {OddsBundle} from '../interfaces/OddsBundle';
import {SocketService} from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class OddsService {
  private odds: OddsBundle;
  private previousOdds: OddsBundle;
  private eventSubscription: Subscription;

  constructor(private http: HttpClient,
              private socket: SocketService) {
    this.oddsFirstUpdate().subscribe(odds => {
      this.odds = odds;
      this.socket.on('odds', msg => {
        this.odds = msg;
      });
    });
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

  oddsFirstUpdate(): Observable<OddsBundle> {
    return this.http.get<OddsBundle>('api/odds');
  }

  checkForUpdate(event_id: number): Observable<OddsBundle> {
    return this.http.get<OddsBundle>('api/odds', {params: {event_id: event_id.toString()}});
  }

  incomingEvent(event_id: number): void {
    this.odds = undefined;
    const source = timer(0, 2000);
    this.eventSubscription = source.subscribe(() => {
      this.checkForUpdate(event_id).subscribe(odds => {
        if (odds.event_id >= event_id) {
          this.odds = odds;
          this.eventSubscription.unsubscribe();
        }
      });
    });
  }
}
