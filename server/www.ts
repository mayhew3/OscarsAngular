#!/usr/bin/env node
import {Server} from 'socket.io';
const debug = require('debug')('OscarsAngular');
const app = require('./app');
import {SocketServer} from './controllers/SocketServer';

app.set('port', process.env.PORT || 6666);

const server = require('http').createServer(app);
const io: Server = require('socket.io')(server);

export const socketServer = new SocketServer();
socketServer.initIO(io);

server.listen(app.get('port'), () => {
  debug('Express server listening on port ' + server.address().port);
});
