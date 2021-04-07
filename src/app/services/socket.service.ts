import {Injectable} from '@angular/core';

import {Socket} from 'socket.io-client';
import _ from 'underscore';
import {ArrayUtil} from '../utility/ArrayUtil';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class SocketService {

  private pendingListeners: PendingListener[] = [];
  private socket: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  init(socket: Socket): void {
    this.socket = socket;
    this.socket.on('error', msg => {
      console.log(`Connect Error: ${JSON.stringify(msg)}`);
    });
    this.socket.on('connect', () => {
      console.log('Connected to socket!');
      const listeners = ArrayUtil.cloneArray(this.pendingListeners);
      _.each(listeners, (pendingListener: PendingListener) => {
        this.on(pendingListener.channel, pendingListener.callback);
        ArrayUtil.removeFromArray(this.pendingListeners, pendingListener);
      });
      this.connectedSubject.next(true);
    });
    this.socket.on('disconnect', () => this.connectedSubject.next(false));
  }

  on(channel, callback: (msg: any) => void): void {
    if (!this.socket) {
      this.pendingListeners.push(new PendingListener(channel, callback));
    } else {
      this.socket.on(channel, callback);
    }
  }

  off(channel, callback): void {
    this.socket.off(channel, callback);
  }

  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }

  get isConnected$(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }
}

class PendingListener {
  constructor(public channel: string,
              public callback: (msg: any) => void) {
  }
}
