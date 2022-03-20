import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, combineLatest, firstValueFrom, Observable} from 'rxjs';
import {MyAuthService} from './auth/my-auth.service';
import {SocketService} from './socket.service';
import {distinctUntilChanged, filter} from 'rxjs/operators';
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

  async getWithoutAuthenticate<T>(url: string, params?: HttpParams): Promise<T> {
    return await this.getWithError<T>(url, params);
  }

  async getAfterAuthenticate<T>(url: string, params?: HttpParams): Promise<T> {
    await this.waitForAuthentication();
    return await this.getWithError<T>(url, params);
  }

  async getAfterFullyConnected<T>(url: string, params?: HttpParams): Promise<T> {
    await this.waitForConnectedToAll();
    return await this.getWithError<T>(url, params);
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

  async postAfterFullyConnected<T>(url: string, body: any): Promise<T> {
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

  private async getWithError<T>(url: string, params?: HttpParams): Promise<any> {
    try {
      return await firstValueFrom(this.http.get<T>(url, {params}));
    } catch (err) {
      this.errorHandler.handleAPIErrorPromise(err);
      throw err;
    }
  }

  private async putWithError<T>(url: string, body: any): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    try {
      await firstValueFrom(this.http.put<T>(url, body, httpOptions));
    } catch (err) {
      this.errorHandler.handleAPIErrorPromise(err);
      throw err;
    }
  }

  private async postWithError<T>(url: string, body: any): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    try {
      await firstValueFrom(this.http.post<T>(url, body, httpOptions));
    } catch (err) {
      this.errorHandler.handleAPIErrorPromise(err);
      throw err;
    }
  }

  private async deleteWithError<T>(url: string, id: number): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    try {
      await firstValueFrom(this.http.delete<T>(`${url}/${id}`, httpOptions));
    } catch (err) {
      this.errorHandler.handleAPIErrorPromise(err);
      throw err;
    }
  }

  private waitForConnectedToAll(): Promise<[boolean, boolean]> {
    return firstValueFrom(this.connectedToAll$);
  }

  private waitForAuthentication(): Promise<boolean> {
    return firstValueFrom(this.auth.isPositivelyAuthenticated$);
  }

}
