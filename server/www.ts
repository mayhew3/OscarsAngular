#!/usr/bin/env node
import {Server} from 'socket.io';
import {SocketServer} from './controllers/SocketServer';
import {typeORM} from './typeorm/TypeORMManager';

const debug = require('debug')('OscarsAngular');
const app = require('./app');

app.set('port', process.env.PORT || 7024);

const server = require('http').createServer(app);
const io: Server = require('socket.io')(server);

export const socketServer = new SocketServer(io);
socketServer.initIO();

typeORM.init().then(() => {
  server.listen(app.get('port'), () => {
    debug('Express server listening on port ' + server.address().port);
  });
});

