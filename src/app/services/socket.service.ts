import { Injectable } from '@angular/core';

import * as socketIo from 'socket.io-client';
import {PersonService} from './person.service';

@Injectable()
export class SocketService {
  private socket;

  constructor(private personService: PersonService) {
    personService.me$.subscribe(me => {
      this.socket = socketIo({
        query: {
          person_id: me.id
        }
      });
      this.socket.on('error', msg => {
        console.log(`Connect Error: ${JSON.stringify(msg)}`);
      });
    });
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
