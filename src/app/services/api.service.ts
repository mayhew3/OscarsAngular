import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {MyAuthService} from './auth/my-auth.service';
import {SocketService} from './socket.service';
import {catchError, distinctUntilChanged, filter, first, mergeMap} from 'rxjs/operators';
import {ErrorNotificationService} from './error-notification.service';
import {Person} from '../interfaces/Person';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private emailVerifiedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
              private auth: MyAuthService,
              private socket: SocketService,
              private errorHandler: ErrorNotificationService) { }

  // REGISTER AUTHENTICATION

  meChanged(person: Person): void {
    this.emailVerifiedSubject.next(!!person);
  }

  // GET

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

  // PUT

  putAfterFullyConnected<T>(url: string, body: any): Observable<any> {
    return this.connectedToAll$.pipe(
      first(),
      mergeMap(() => this.putWithError(url, body))
    );
  }

  executePutAfterFullyConnected<T>(url: string, body: any): void {
    this.putAfterFullyConnected(url, body).subscribe();
  }

  // POST

  postAfterFullyConnected<T>(url: string, body: any): Observable<any> {
    return this.connectedToAll$.pipe(
      first(),
      mergeMap(() => this.postWithError(url, body))
    );
  }

  executePostAfterFullyConnected<T>(url: string, body: any): void {
    this.postAfterFullyConnected(url, body).subscribe();
  }

  // DELETE

  deleteAfterFullyConnected<T>(url: string, id: number): Observable<any> {
    return this.connectedToAll$.pipe(
      first(),
      mergeMap(() => this.deleteWithError(url, id))
    );
  }

  executeDeleteAfterFullyConnected<T>(url: string, id: number): void {
    this.deleteAfterFullyConnected(url, id).subscribe();
  }

  /* HELPER METHODS */

  private getWithError<T>(url: string, params?: HttpParams): Observable<any> {
    return this.http.get<T>(url, {params}).pipe(
      catchError(this.errorHandler.handleAPIError())
    );
  }

  private putWithError<T>(url: string, body: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.put<T>(url, body, httpOptions).pipe(
      catchError(this.errorHandler.handleAPIError())
    );
  }

  private postWithError<T>(url: string, body: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post<T>(url, body, httpOptions).pipe(
      catchError(this.errorHandler.handleAPIError())
    );
  }

  private deleteWithError<T>(url: string, id: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.delete<T>(`${url}/${id}`, httpOptions).pipe(
      catchError(this.errorHandler.handleAPIError())
    );
  }

  private get emailVerified$(): Observable<boolean> {
    return this.emailVerifiedSubject.asObservable();
  }

  private get connectedToAll$(): Observable<[boolean, boolean]> {
    return combineLatest([
      this.emailVerified$.pipe(distinctUntilChanged()),
      this.socket.isConnected$.pipe(distinctUntilChanged())
    ]).pipe(
      filter(([isAuthenticated, isConnected]) => !!isAuthenticated && !!isConnected)
    );
  }

}
