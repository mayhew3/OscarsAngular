const model = require('./model');
const _ = require('underscore');

exports.getSystemVars = function(request, response) {
  model.SystemVars.findAll().then(systemVars => {
    return response.json(systemVars);
  });
};
