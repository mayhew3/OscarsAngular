import { Injectable } from '@angular/core';

import * as socketIo from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

@Injectable()
export class SocketService {
  public socket;

  constructor() {
    this.socket = socketIo(SERVER_URL);
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
