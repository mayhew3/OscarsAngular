import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {combineLatest, Observable} from 'rxjs';
import {MyAuthService} from './auth/my-auth.service';
import {SocketService} from './socket.service';
import {catchError, distinctUntilChanged, filter, mergeMap} from 'rxjs/operators';
import {ErrorNotificationService} from './error-notification.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient,
              private auth: MyAuthService,
              private socket: SocketService,
              private errorHandler: ErrorNotificationService) { }

  getAfterAuthenticate<T>(url: string, params?: HttpParams): Observable<any> {
    return this.auth.isPositivelyAuthenticated$.pipe(
      mergeMap(() => this.getWithError(url, params))
    );
  }

  getAfterFullyConnected<T>(url: string, params?: HttpParams): Observable<any> {
    return this.connectedToAll$.pipe(
      mergeMap(() => this.getWithError(url, params))
    );
  }

  private getWithError<T>(url: string, params?: HttpParams): Observable<any> {
    return this.http.get<T>(url, {params}).pipe(
      catchError(this.errorHandler.handleAPIError())
    );
  }

  private get connectedToAll$(): Observable<[boolean, boolean]> {
    return combineLatest([
      this.auth.isAuthenticated$.pipe(distinctUntilChanged()),
      this.socket.isConnected$.pipe(distinctUntilChanged())
    ]).pipe(
      filter(([isAuthenticated, isConnected]) => !!isAuthenticated && !!isConnected)
    );
  }

}
