const model = require('./model');
const socket = require('./sockets_controller');

exports.getSystemVars = function(request, response) {
  model.SystemVars.findAll().then(systemVars => {
    return response.json(systemVars);
  });
};

exports.updateSystemVars = async function(request, response) {
  let systemVar = request.body;
  systemVar.voting_open = systemVar.voting_open ? 1 : 0;

  let result;
  try {
    result = await model.SystemVars.findByPk(systemVar.id);
  } catch (err) {
    console.error(error);
    response.send({msg: "Error finding system_var: " + error});
  }

  const isVotingOpenChanged = result.voting_open !== systemVar.voting_open;

  try {
    await result.update(systemVar);
  } catch (err) {
    console.error(error);
    response.send({msg: "Error updating system_vars: " + JSON.stringify(systemVar)});
  }

  if (isVotingOpenChanged) {
    const msg = {
      voting_open: systemVar.voting_open
    };
    socket.emitToAll('voting', msg);
  }

  response.json({msg: 'Success'});
};
