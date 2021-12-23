import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, combineLatest, firstValueFrom, Observable} from 'rxjs';
import {MyAuthService} from './auth/my-auth.service';
import {SocketService} from './socket.service';
import {catchError, distinctUntilChanged, filter, mergeMap} from 'rxjs/operators';
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

  get emailVerified$(): Observable<boolean> {
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

  async putAfterFullyConnected<T>(url: string, body: any): Promise<any> {
    await this.waitForConnectedToAll();
    return this.putWithError(url, body);
  }

  async executePutAfterFullyConnected<T>(url: string, body: any): Promise<void> {
    await this.putAfterFullyConnected(url, body);
  }

  // POST

  async postAfterFullyConnected<T>(url: string, body: any): Promise<any> {
    await this.waitForConnectedToAll();
    return this.postWithError(url, body);
  }

  async executePostAfterFullyConnected<T>(url: string, body: any): Promise<void> {
    await this.postAfterFullyConnected(url, body);
  }

  // DELETE

  async deleteAfterFullyConnected<T>(url: string, id: number): Promise<any> {
    await this.waitForConnectedToAll();
    return this.deleteWithError(url, id);
  }

  async executeDeleteAfterFullyConnected<T>(url: string, id: number): Promise<void> {
    await this.deleteAfterFullyConnected(url, id);
  }

  /* HELPER METHODS */

  private getWithError<T>(url: string, params?: HttpParams): Observable<any> {
    return this.http.get<T>(url, {params}).pipe(
      catchError(this.errorHandler.handleAPIError())
    );
  }

  private async putWithError<T>(url: string, body: any): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    await firstValueFrom(this.http.put<T>(url, body, httpOptions));
  }

  private async postWithError<T>(url: string, body: any): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    await firstValueFrom(this.http.post<T>(url, body, httpOptions));
  }

  private async deleteWithError<T>(url: string, id: number): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    await firstValueFrom(this.http.delete<T>(`${url}/${id}`, httpOptions));
  }

  private waitForConnectedToAll(): Promise<[boolean, boolean]> {
    return firstValueFrom(this.connectedToAll$);
  }

}
