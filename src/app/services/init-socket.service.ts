import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {PersonService} from './person.service';
import {io} from 'socket.io-client';
import {distinctUntilChanged} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InitSocketService {

  constructor(private socketService: SocketService,
              private personService: PersonService) {
    this.personService.me$.pipe(
      distinctUntilChanged()
    ).subscribe(me => {
      const socket = io({
        query: {
          person_id: me.id.toString()
        }
      });
      this.socketService.init(socket);
    });
  }
}
