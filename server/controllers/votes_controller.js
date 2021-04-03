const model = require('./model');
const _ = require('underscore');
const socket = require('./sockets_controller');

exports.getVotes = function(request, response) {
  model.Vote.findAll({
    where: {
      year: request.query.year
    }
  }).then(votes => {
    return response.json(votes);
  });
};

exports.addOrUpdateVote = function(request, response) {
  model.Vote.findAll({
    where: {
      category_id: request.body.category_id,
      person_id: request.body.person_id,
      year: request.body.year
    }
  }).then(votes => {
    if (votes.length > 1) {
      response.send(500, "Multiple votes found!");
      throw new Error("Multiple votes found!");
    } else if (votes.length === 1) {
      let vote = votes[0];
      const nomination_id = request.body.nomination_id;
      vote.update({nomination_id: nomination_id})
        .then(result => {
          socket.emitToAll('change_vote', {vote_id: vote.id, nomination_id: nomination_id})
          return response.json(result);
        })
        .catch(err => {
          response.send(500, "Error updating existing vote!");
          throw new Error(err);
        });
    } else {
      model.Vote
        .create(request.body)
        .then(result => {
          socket.emitToAll('add_vote', result)
          return response.json(result);
        })
        .catch(err => {
          response.send(500, "Error submitting vote!");
          throw new Error(err);
        });
    }
  });
};
