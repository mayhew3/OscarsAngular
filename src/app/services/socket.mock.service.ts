import {Injectable} from '@angular/core';
import {InMemoryDataService} from './in-memory-data-service';

@Injectable()
export class SocketServiceMock {

  constructor(private inMemoryDB: InMemoryDataService) {
  }

  init(): void {
  }

  on(channel, callback): void {
    this.inMemoryDB.on(channel, callback);
  }

  removeListener(channel, callback): void {
    this.inMemoryDB.removeCallback(channel, callback);
  }

  emit(channel, msg): void {
    console.log('Message sent to channel ' + channel + ': ' + JSON.stringify(msg));
    this.inMemoryDB.broadcastToChannel(channel, msg);
  }

  isConnected(): boolean {
    return true;
  }
}
