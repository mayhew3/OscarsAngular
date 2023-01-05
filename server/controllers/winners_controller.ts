import {socketServer} from '../www';
import {TypeORMManager} from '../typeorm/TypeORMManager';
import {Winner} from '../typeorm/Winner';
import {Event} from '../typeorm/Event';
import {getRepository} from 'typeorm';
import {Request, Response} from 'express';
import {getCurrentCeremonyYear} from './systemvars_controller';

export const addWinner = async (request: Request, response: Response): Promise<void> => {
  const nomination_id = request.body.nomination_id;

  const winner = await TypeORMManager.createAndCommit(request.body, Winner);

  const event_time = winner.declared;
  const year = winner.year;

  const ceremony_year_id = await getCurrentCeremonyYear();

  const event = await TypeORMManager.createAndCommit({
    type: 'winner',
    detail: 'add',
    event_time,
    nomination_id,
    year,
    ceremony_year_id
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

};

export const resetWinners = async (request: Request, response: Response): Promise<void> => {
  const year = request.body.year;

  await getRepository(Winner).delete({year});

  const event_time = new Date();

  const ceremony_year_id = await getCurrentCeremonyYear();

  const event = await TypeORMManager.createAndCommit({
    type: 'winner',
    detail: 'reset',
    event_time,
    year,
    ceremony_year_id
  }, Event);

  const msg = {
    event_id: event.id,
    event_time,
    year
  };
  socketServer.emitToAll('reset_winners', msg);

  response.json({msg: 'Success!'});
};

export const deleteWinner = async (request: Request, response: Response): Promise<void> => {
  const winner_id = +request.params.id;

  const winnerRepository = getRepository(Winner);
  const winner = await winnerRepository.findOne({
    where: {
      id: winner_id
    }
  });

  if (!winner) {
    throw new Error('No winner found with ID ' + winner_id);
  }

  const year = winner.year;

  const nomination_id = winner.nomination_id;

  await winnerRepository.remove(winner);

  const event_time = new Date();

  const ceremony_year_id = await getCurrentCeremonyYear();

  const event = await TypeORMManager.createAndCommit({
    type: 'winner',
    detail: 'delete',
    event_time,
    nomination_id,
    year,
    ceremony_year_id
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

