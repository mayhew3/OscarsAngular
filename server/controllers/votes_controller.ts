import {socketServer} from '../www';

import {TypeORMManager} from '../typeorm/TypeORMManager';
import {getRepository} from 'typeorm';
import {Vote} from '../typeorm/Vote';

export const getVotes = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const votes = await getRepository(Vote).find({
    where: {
      year: request.query.year
    }
  });
  response.json(votes);
};

export const addOrUpdateVote = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const voteRepository = getRepository(Vote);
  const votes = await voteRepository.find({
    where: {
      category_id: request.body.category_id,
      person_id: request.body.person_id,
      year: request.body.year
    }
  });

  if (votes.length > 1) {
    response.send(500, 'Multiple votes found!');
    throw new Error('Multiple votes found!');
  } else if (votes.length === 1) {
    const vote = votes[0];
    const nomination_id = request.body.nomination_id;

    voteRepository.update(vote.id,{nomination_id})
      .then(result => {
        socketServer.emitToAll('change_vote', {vote_id: vote.id, nomination_id});
        return response.json(result);
      })
      .catch(err => {
        response.send(500, 'Error updating existing vote!');
        throw new Error(err);
      });
  } else {
    try {
      const result = await TypeORMManager.createAndCommit(request.body, Vote);
      socketServer.emitToAll('add_vote', result);
      return response.json(result);
    } catch (err: any) {
      response.send(500, 'Error submitting vote!');
      throw new Error(err);
    }

  }
};
