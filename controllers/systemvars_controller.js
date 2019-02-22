const model = require('./model');
const _ = require('underscore');

exports.getSystemVars = function(request, response) {
  model.SystemVars.findAll().then(systemVars => {
    return response.json(systemVars);
  });
};

exports.updateSystemVars = function(request, response) {
  let systemVar = request.body;
  let intValue = systemVar.voting_open ? 1 : 0;
  systemVar.voting_open = intValue;

  model.SystemVars.findByPk(systemVar.id).then(result => {
    result.update(systemVar).then(() => {
      response.json({msg: "Success!"});
    }).catch(error => {
      console.error(error);
      response.send({msg: "Error updating system_vars: " + JSON.stringify(systemVar)})
    });
  }).catch(error => {
    console.error(error);
    response.send({msg: "Error finding system_var: " + error});
  });
};
