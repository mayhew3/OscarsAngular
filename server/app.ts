import express from 'express';
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../../oscars')));


require('./routes.js')(app);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../oscars/index.html'));
});

module.exports = app;
