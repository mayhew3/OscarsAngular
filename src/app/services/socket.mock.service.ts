import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import {InMemoryDataService} from './in-memory-data-service';

@Injectable()
export class SocketServiceMock {

  constructor(private inMemoryDB: InMemoryDataService) {
  }

  on(channel, callback): void {
    this.inMemoryDB.on(channel, callback);
  }

  removeListener(channel, callback): void {
    this.inMemoryDB.removeCallback(channel, callback);
  }

  isConnected(): boolean {
    return true;
  }
}
