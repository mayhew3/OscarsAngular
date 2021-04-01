import {Injectable} from '@angular/core';

import * as socketIo from 'socket.io-client';
import {PersonService} from './person.service';
import _ from 'underscore';

@Injectable()
export class SocketService {
  private socket;

  pendingListeners: PendingListener[] = [];

  constructor() {
    this.socket = socketIo();
    this.socket.on('error', msg => {
      console.log(`Connect Error: ${JSON.stringify(msg)}`);
    });
    this.socket.on('connect', () => {
      _.each(this.pendingListeners, (pendingListener: PendingListener) => this.on(pendingListener.channel, pendingListener.callback));
    });
  }

  on(channel, callback: (msg: any) => void): void {
    if (!this.socket) {
      this.pendingListeners.push(new PendingListener(channel, callback));
    } else {
      this.socket.on(channel, callback);
    }
  }

  removeListener(channel, callback): void {
    this.socket.removeListener(channel, callback);
  }

  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }
}

class PendingListener {
  constructor(public channel: string,
              public callback: (msg: any) => void) {
  }
}
