const model = require('./model');
const socket = require('./sockets_controller');

exports.getSystemVars = function(request, response) {
  model.SystemVars.findAll().then(systemVars => {
    return response.json(systemVars);
  });
};

exports.updateSystemVars = async function(request, response) {
  let systemVar = request.body;

  let result;
  try {
    result = await model.SystemVars.findByPk(systemVar.id);
  } catch (err) {
    console.error(err);
    response.send({msg: "Error finding system_var: " + error});
  }

  const isVotingOpenChanged = result.voting_open !== systemVar.voting_open;

  try {
    await result.update(systemVar);
  } catch (err) {
    console.error(err);
    response.send({msg: "Error updating system_vars: " + JSON.stringify(systemVar)});
  }

  if (isVotingOpenChanged) {
    const event_time = new Date;
    const event = await model.Event.create({
      type: 'voting',
      detail: !!systemVar.voting_open ? 'open' : 'locked',
      event_time: event_time
    });

    const msg = {
      event_id: event.id,
      event_time: event_time
    };

    if (!systemVar.voting_open) {
      socket.emitToAll('voting_locked', msg);
    } else {
      socket.emitToAll('voting_unlocked', msg);
    }


  }

  response.json({msg: 'Success'});
};
