import {Injectable} from '@angular/core';
import {InMemoryDataService} from './in-memory-data-service';
import {Observable, of} from 'rxjs';

@Injectable()
export class SocketServiceMock {

  constructor(private inMemoryDB: InMemoryDataService) {
  }

  on(channel, callback): void {
    this.inMemoryDB.on(channel, callback);
  }

  off(channel, callback): void {
    this.inMemoryDB.off(channel, callback);
  }

  isConnected(): boolean {
    return true;
  }

  get isConnected$(): Observable<boolean> {
    return of(true);
  }
}
