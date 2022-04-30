import express, {Express} from 'express';
import {types} from 'pg';

const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const enforce = require('express-sslify');
const app: Express = express();

app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../../oscars')));
app.use('/bootstrap_js', express.static(__dirname + '../../../node_modules/bootstrap/dist/js/'));
app.use('/jquery_js', express.static(__dirname + '../../../node_modules/jquery/dist/'));
app.use('/popper_js', express.static(__dirname + '../../../node_modules/@popperjs/core/dist/umd/'));

types.setTypeParser(types.builtins.NUMERIC, val => +val);

require('./routes.js')(app);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../oscars/index.html'));
});

module.exports = app;
