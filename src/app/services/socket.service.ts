import { Injectable } from '@angular/core';

import * as socketIo from 'socket.io-client';

@Injectable()
export class SocketService {
  private socket;

  constructor() {
    this.socket = socketIo();
  }

  on(channel, callback): void {
    this.socket.on(channel, callback);
  }

  removeListener(channel, callback): void {
    this.socket.removeListener(channel, callback);
  }

  isConnected(): boolean {
    return this.socket.connected;
  }
}
