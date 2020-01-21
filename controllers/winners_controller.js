const model = require('./model');
const socket = require('./sockets_controller');
const _ = require('underscore');

exports.addOrDeleteWinner = async function(request, response) {
  const nomination_id = request.body.nomination_id;

  let winner = await model.Winner.findOne({
    where: {
      nomination_id: request.body.nomination_id
    }
  });

  if (!!winner) {
    await deleteWinner(winner, response, nomination_id);
  } else {
    await addWinner(request, response, nomination_id);
  }
};

async function deleteWinner(winner, response, nomination_id) {
  try {
    await winner.destroy();
  } catch (err) {
    response.send(500, "Error deleting existing winner!");
    throw new Error(err);
  }

  const event_time = new Date;

  const event = await model.Event.create({
    type: 'winner',
    detail: 'delete',
    event_time: event_time,
    nomination_id: nomination_id
  });

  const msg = {
    detail: 'delete',
    nomination_id: nomination_id,
    event_id: event.id,
    event_time: event_time
  };
  socket.emitToAll('winner', msg);

  response.json({msg: 'Success'});
}

async function addWinner(request, response, nomination_id) {
  let winner;
  try {
    winner = await model.Winner
      .create(request.body);
  } catch (err) {
    response.send(500, "Error submitting winner!");
    throw new Error(err);
  }

  const event_time = winner.declared;

  const event = await model.Event.create({
    type: 'winner',
    detail: 'add',
    event_time: event_time,
    nomination_id: nomination_id
  });

  const msg = {
    detail: 'add',
    nomination_id: nomination_id,
    event_id: event.id,
    event_time: event_time,
    winner_id: winner.id,
    declared: event_time
  };
  socket.emitToAll('winner', msg);

  response.json({msg: 'Success'});
}
