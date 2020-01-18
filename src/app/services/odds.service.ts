import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscription, timer} from 'rxjs';
import {OddsBundle} from '../interfaces/OddsBundle';
import {Socket} from 'ngx-socket-io';
import {CategoryService} from './category.service';

@Injectable({
  providedIn: 'root'
})
export class OddsService {
  private odds: OddsBundle;
  private eventSubscription: Subscription;

  constructor(private http: HttpClient,
              private socket: Socket) {
    this.oddsFirstUpdate().subscribe(odds => {
      this.odds = odds;
      this.socket.on('odds', msg => {
        this.odds = msg;
      });
    });
  }

  clearOdds(): void {
    this.odds = undefined;
  }

  getOdds(): OddsBundle {
    return this.odds;
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
