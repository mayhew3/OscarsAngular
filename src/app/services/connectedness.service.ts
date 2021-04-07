import {Injectable} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {SocketService} from './socket.service';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectednessService {

  constructor(private auth: AuthService,
              private socket: SocketService) { }

  get connectedToAll$(): Observable<[boolean, boolean]> {
    return combineLatest([
      this.auth.isAuthenticated$.pipe(distinctUntilChanged()),
      this.socket.isConnected$.pipe(distinctUntilChanged())
    ]).pipe(
      filter(([isAuthenticated, isConnected]) => !!isAuthenticated && !!isConnected)
    );
  }

}
