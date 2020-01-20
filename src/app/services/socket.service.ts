import { Injectable } from '@angular/core';

import * as socketIo from 'socket.io-client';

@Injectable()
export class SocketService {
  public socket;

  constructor() {
    this.socket = socketIo();
  }

  on(channel, callback) {
    this.socket.on(channel, callback);
  }

  removeListener(channel, callback) {
    this.socket.removeListener(channel, callback);
  }

  isConnected() {
    return this.socket.connected;
  }
}
