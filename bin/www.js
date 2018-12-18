#!/usr/bin/env node
let app = require('../app');

app.set('port', process.env.PORT || 5000);

let server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
