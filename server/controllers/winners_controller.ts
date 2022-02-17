import {socketServer} from '../www';
import {TypeORMManager} from '../typeorm/TypeORMManager';
import {Winner} from '../typeorm/Winner';
import {Event} from '../typeorm/Event';
import {getRepository} from 'typeorm';

export const addWinner = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const nomination_id = request.body.nomination_id;

  try {
    const winner = await TypeORMManager.createAndCommit(request.body, Winner);

    const event_time = winner.declared;
    const year = winner.year;

    const event = await TypeORMManager.createAndCommit({
      type: 'winner',
      detail: 'add',
      event_time,
      nomination_id,
      year
    }, Event);

    const msg = {
      nomination_id,
      event_id: event.id,
      event_time,
      winner_id: winner.id,
      declared: event_time
    };
    socketServer.emitToAll('add_winner', msg);

    await response.json(winner);

  } catch (err) {
    response.send(500, 'Error submitting winner!');
    throw new Error(err);
  }
};

export const resetWinners = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const year = request.body.year;

  await getRepository(Winner).delete({year});

  const event_time = new Date();

  const event = await TypeORMManager.createAndCommit({
    type: 'winner',
    detail: 'reset',
    event_time,
    year
  }, Event);

  const msg = {
    event_id: event.id,
    event_time,
    year
  };
  socketServer.emitToAll('reset_winners', msg);

  response.json({msg: 'Success!'});
};

export const deleteWinner = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const winner_id = +request.params.id;

  const winnerRepository = getRepository(Winner);
  const winner = await winnerRepository.findOne({
    where: {
      id: winner_id
    }
  });

  const year = winner.year;

  const nomination_id = winner.nomination_id;

  try {
    await winnerRepository.remove(winner);
  } catch (err) {
    response.send(500, 'Error deleting existing winner!');
    throw new Error(err);
  }

  const event_time = new Date();

  const event = await TypeORMManager.createAndCommit({
    type: 'winner',
    detail: 'delete',
    event_time,
    nomination_id,
    year
  }, Event);

  const msg = {
    nomination_id,
    event_id: event.id,
    event_time,
    winner_id
  };
  socketServer.emitToAll('remove_winner', msg);

  response.json({msg: 'Success'});
};

