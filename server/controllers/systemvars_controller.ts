import * as model from './model';
import {socketServer} from '../www';

export const getSystemVars = (request, response) => {
  model.SystemVars.findAll().then(systemVars => response.json(systemVars));
};

export const updateSystemVars = async (request, response) => {
  const systemVar = request.body;

  let result;
  try {
    result = await model.SystemVars.findByPk(systemVar.id);
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error finding system_var: ' + err});
  }

  const isVotingOpenChanged = systemVar.voting_open !== undefined && result.voting_open !== systemVar.voting_open;

  try {
    await result.update(systemVar);
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating system_vars: ' + JSON.stringify(systemVar)});
  }

  if (isVotingOpenChanged) {
    const event_time = new Date();
    const event = await model.Event.create({
      type: 'voting',
      detail: !!systemVar.voting_open ? 'open' : 'locked',
      event_time
    });

    const msg = {
      event_id: event.id,
      event_time
    };

    if (systemVar.voting_open === false) {
      socketServer.emitToAll('voting_locked', msg);
    } else if (systemVar.voting_open === true) {
      socketServer.emitToAll('voting_unlocked', msg);
    }


  }

  response.json({msg: 'Success'});
};
