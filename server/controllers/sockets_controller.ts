import _ from 'underscore';
import {ArrayUtil} from '../../src/app/utility/ArrayUtil';

export class SocketServer {

  clients = [];
  persons = [];
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

  io;

  initIO(in_io) {
    this.io = in_io;
    this.io.on('connection', client => {
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

  addToPersonRooms(room_name) {
    if (!_.contains(this.existing_person_rooms, room_name)) {
      this.existing_person_rooms.push(room_name);
    }
  };

  initAllRooms(client, person_id) {
    if (!!person_id) {
      // initPersonRoom(client, person_id);
    }
    // initPersonalChannels(client);
    this.initGlobalChannels(client);
  }

  initPersonRoom(client, person_id) {
    const room_name = 'person_' + person_id;
    client.join(room_name);
    this.addToPersonRooms(room_name);
  }

  initPersonalChannels(client) {
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

  initGlobalChannels(client) {
    _.each(this.globalChannels, channelName => {
      client.on(channelName, msg => {
        console.log(`Message received on channel ${channelName} to everyone.`);
        this.io.emit(channelName, msg);
      });
    });
  }

  /* API */

  getNumberOfClients() {
    return this.clients.length;
  };

  emitToAll(channel, msg) {
    this.io.emit(channel, msg);
  };

  emitToPerson(person_id, channel, msg) {
    const clientsForPerson = this.getClientsForPerson(person_id);
    this.emitToClients(clientsForPerson, channel, msg);
  };

  emitToAllExceptPerson(person_id, channel, msg) {
    const clientsForEveryoneExceptPerson = this.getClientsForEveryoneExceptPerson(person_id);
    this.emitToClients(clientsForEveryoneExceptPerson, channel, msg);
  };


  /* PRIVATE METHODS */

  addClientForPerson(person_id, client) {
    const existingArray = _.findWhere(this.persons, {person_id});
    if (!existingArray) {
      this.persons.push({
        person_id,
        clients: [client]
      });
    } else {
      existingArray.clients.push(client);
    }
  }

  removeClientForPerson(person_id, client) {
    const existingArray = _.findWhere(this.persons, {person_id});
    if (!existingArray) {
      console.log('Warning: Disconnect received for person_id that never connected: ' + person_id);
    } else {
      ArrayUtil.removeFromArray(existingArray.clients, client);
    }
  }

  getClientsForPerson(person_id) {
    const existingArray = _.findWhere(this.persons, {person_id});
    if (!existingArray) {
      return [];
    } else {
      return existingArray.clients;
    }
  }

  getClientsForEveryoneExceptPerson(person_id) {
    const otherPersons = _.filter(this.persons, person => person_id !== person.person_id);
    const clients = [];
    _.each(otherPersons, person => ArrayUtil.addToArray(clients, person.clients));
    return clients;
  }

  emitToClients(clients, channel, msg) {
    _.each(clients, client => {
      client.emit(channel, msg);
    });
  }

}
