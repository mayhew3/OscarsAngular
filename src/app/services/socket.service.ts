import {Injectable} from '@angular/core';

import {io, Socket} from 'socket.io-client';
import _ from 'underscore';
import {ArrayUtil} from '../utility/ArrayUtil';
import {MeService} from './me.service';

@Injectable()
export class SocketService {

  private pendingListeners: PendingListener[] = [];
  private socket: Socket;

  constructor(private meService: MeService) {
  }

  init(): void {
    this.meService.me$.subscribe(me => {
      this.socket = io({
        query: {
          person_id: me.id.toString()
        }
      });
      this.socket.on('error', msg => {
        console.log(`Connect Error: ${JSON.stringify(msg)}`);
      });
      this.socket.on('connect', () => {
        const listeners = ArrayUtil.cloneArray(this.pendingListeners);
        _.each(listeners, (pendingListener: PendingListener) => {
          this.on(pendingListener.channel, pendingListener.callback);
          ArrayUtil.removeFromArray(this.pendingListeners, pendingListener);
        });
      });
    });
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
}

class PendingListener {
  constructor(public channel: string,
              public callback: (msg: any) => void) {
  }
}
