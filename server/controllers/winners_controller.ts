import * as model from './model';
const socket = require('./sockets_controller');

export const addWinner = async (request, response) => {
  const nomination_id = request.body.nomination_id;

  try {
    const winner = await model.Winner
      .create(request.body);

    const event_time = winner.declared;

    const event = await model.Event.create({
      type: 'winner',
      detail: 'add',
      event_time,
      nomination_id
    });

    const msg = {
      nomination_id,
      event_id: event.id,
      event_time,
      winner_id: winner.id,
      declared: event_time
    };
    socket.emitToAll('add_winner', msg);

    await response.json(winner);

  } catch (err) {
    response.send(500, 'Error submitting winner!');
    throw new Error(err);
  }
};

export const resetWinners = async (request, response) => {
  const year = request.body.year;

  await model.Winner.destroy({
    where: {year}
  });

  const event_time = new Date();

  const event = await model.Event.create({
    type: 'winner',
    detail: 'reset',
    event_time
  });

  const msg = {
    event_id: event.id,
    event_time,
    year
  };
  socket.emitToAll('reset_winners', msg);

  response.json({msg: 'Success!'});
};

export const deleteWinner = async (request, response) => {
  const winner_id = +request.params.id;

  const winner = await model.Winner.findOne({
    where: {
      id: winner_id
    }
  });

  const nomination_id = winner.nomination_id;

  try {
    await winner.destroy();
  } catch (err) {
    response.send(500, 'Error deleting existing winner!');
    throw new Error(err);
  }

  const event_time = new Date();

  const event = await model.Event.create({
    type: 'winner',
    detail: 'delete',
    event_time,
    nomination_id
  });

  const msg = {
    nomination_id,
    event_id: event.id,
    event_time,
    winner_id
  };
  socket.emitToAll('remove_winner', msg);

  response.json({msg: 'Success'});
};

