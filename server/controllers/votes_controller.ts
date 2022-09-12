import {socketServer} from '../www';

import {TypeORMManager} from '../typeorm/TypeORMManager';
import {getRepository} from 'typeorm';
import {Vote} from '../typeorm/Vote';
import {Request, Response} from 'express/ts4.0';

export const getVotes = async (request: Request, response: Response): Promise<void> => {
  const votes = await getRepository(Vote).find({
    where: {
      year: request.query.year
    }
  });
  response.json(votes);
};

export const addOrUpdateVote = async (request: Request, response: Response): Promise<void> => {
  const voteRepository = getRepository(Vote);
  const votes = await voteRepository.find({
    where: {
      category_id: request.body.category_id,
      person_id: request.body.person_id,
      year: request.body.year
    }
  });

  if (votes.length > 1) {
    throw new Error('Multiple votes found!');
  } else if (votes.length === 1) {
    const vote = votes[0];
    const nomination_id = request.body.nomination_id;

    if (nomination_id !== vote.nomination_id) {
      voteRepository.update(vote.id, {nomination_id})
        .then(result => {
          socketServer.emitToAll('change_vote', {vote_id: vote.id, nomination_id});
          response.json(result);
        });
    } else {
      const vote_id = vote.id;
      voteRepository.delete({id: vote_id}).then(result => {
        socketServer.emitToAll('unvote', {vote_id});
        response.json(result);
      });
    }
  } else {
    const result = await TypeORMManager.createAndCommit(request.body, Vote);
    socketServer.emitToAll('add_vote', result);
    response.json(result);
  }
};
