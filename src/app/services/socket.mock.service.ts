import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import {InMemoryDataService} from './in-memory-data-service';

@Injectable()
export class SocketServiceMock {

  constructor(private inMemoryDB: InMemoryDataService) {
  }

  on(channel, callback) {
    this.inMemoryDB.on(channel, callback);
  }

  removeListener(channel, callback) {
    this.inMemoryDB.removeCallback(channel, callback);
  }

  isConnected() {
    return true;
  }
}
