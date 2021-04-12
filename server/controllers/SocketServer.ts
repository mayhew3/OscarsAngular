import _ from 'underscore';
import {ArrayUtil} from '../../src/app/utility/ArrayUtil';
import {Server, Socket} from 'socket.io';

export class SocketServer {

  clients: Socket[] = [];
  persons: Person[] = [];
  existing_person_rooms = [];

  globalChannels = [
    'odds',
    'add_vote',
    'change_vote',
    'voting_locked',
    'voting_unlocked',
    'add_winner',
    'remove_winner',
    'reset_winners'
  ];

  personalChannels = [
  ];

  io: Server;

  initIO(in_io: Server): void {
    this.io = in_io;
    this.io.on('connection', (client: Socket) => {
      console.log('Connection established. Adding client.');
      this.clients.push(client);

      const person_id_str = client.handshake.query.person_id;

      let person_id;
      if (!!person_id_str) {
        person_id = +person_id_str;
        this.addClientForPerson(person_id, client);
      }

      this.initAllRooms(client, person_id);

      client.on('disconnect', () => {
        console.log('Client disconnected. Removing from array.');
        ArrayUtil.removeFromArray(this.clients, client);

        if (!!person_id) {
          this.removeClientForPerson(person_id, client);
        }
      });
    });

  };

  addToPersonRooms(room_name: string): void {
    if (!_.contains(this.existing_person_rooms, room_name)) {
      this.existing_person_rooms.push(room_name);
    }
  };

  initAllRooms(client, person_id): void {
    if (!!person_id) {
      // initPersonRoom(client, person_id);
    }
    // initPersonalChannels(client);
    this.initGlobalChannels(client);
  }

  initPersonRoom(client, person_id): void {
    const room_name = 'person_' + person_id;
    client.join(room_name);
    this.addToPersonRooms(room_name);
  }

  initPersonalChannels(client): void {
    _.each(this.personalChannels, channelName => {
      client.on(channelName, msg => {
        if (!msg.person_id) {
          console.error('No person id on message for channel \'' + channelName + '\'');
        }
        console.log('Message received on channel \'' + channelName + '\' to person ' + msg.person_id);
        const room_name = 'person_' + msg.person_id;
        client.to(room_name).emit(channelName, msg);
      });
    });
  }

  initGlobalChannels(client): void {
    _.each(this.globalChannels, channelName => {
      client.on(channelName, msg => {
        console.log(`Message received on channel ${channelName} to everyone.`);
        this.io.emit(channelName, msg);
      });
    });
  }

  /* API */

  getNumberOfClients(): number {
    return this.clients.length;
  };

  emitToAll(channel, msg): void {
    this.io.emit(channel, msg);
  };

  emitToPerson(person_id, channel, msg): void {
    const clientsForPerson = this.getClientsForPerson(person_id);
    this.emitToClients(clientsForPerson, channel, msg);
  };

  emitToAllExceptPerson(person_id, channel, msg): void {
    const clientsForEveryoneExceptPerson = this.getClientsForEveryoneExceptPerson(person_id);
    this.emitToClients(clientsForEveryoneExceptPerson, channel, msg);
  };

  getConnectedPersons(): number[] {
    return _.map(this.persons, p => p.id);
  }


  /* PRIVATE METHODS */

  addClientForPerson(person_id: number, client: Socket): void {
    let person = _.findWhere(this.persons, {id: person_id});
    if (!person) {
      person = new Person(person_id, client);
      this.persons.push(person);
    } else {
      person.addClient(client);
    }
  }

  removeClientForPerson(person_id: number, client: Socket): void {
    const person = _.findWhere(this.persons, {id: person_id});
    if (!person) {
      console.log('Warning: Disconnect received for person_id that never connected: ' + person_id);
    } else {
      person.removeClient(client);
    }
  }

  getClientsForPerson(person_id: number): Socket[] {
    const person = _.findWhere(this.persons, {id: person_id});
    if (!person) {
      return [];
    } else {
      return person.getClients();
    }
  }

  getClientsForEveryoneExceptPerson(person_id: number): Socket[] {
    const otherPersons = _.filter(this.persons, person => person_id !== person.id);
    const clients: Socket[] = [];
    _.each(otherPersons, person => ArrayUtil.addToArray(clients, person.getClients()));
    return clients;
  }

  emitToClients(clients: Socket[], channel: string, msg: any): void {
    _.each(clients, client => {
      client.emit(channel, msg);
    });
  }

}

class Person {
  private clients: Socket[] = [];
  constructor(public id: number,
              private client: Socket) {
    this.clients.push(client);
  }

  addClient(client: Socket): void {
    this.clients.push(client);
  }

  removeClient(client: Socket): void {
    ArrayUtil.removeFromArray(this.clients, client);
  }

  getClients(): Socket[] {
    return ArrayUtil.cloneArray(this.clients);
  }
}
