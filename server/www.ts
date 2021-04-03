#!/usr/bin/env node
import {Server} from 'socket.io';
const debug = require('debug')('OscarsAngular');
const app = require('./app');
const sockets = require('./controllers/sockets_controller');

app.set('port', process.env.PORT || 5000);

const server = require('http').createServer(app);
const io: Server = require('socket.io')(server);

sockets.initIO(io);

server.listen(app.get('port'), () => {
  debug('Express server listening on port ' + server.address().port);
});
