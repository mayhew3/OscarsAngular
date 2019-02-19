const model = require('./model');
const _ = require('underscore');

exports.getVote = function(request, response) {
  model.Vote.findAll({
    where: {
      category_id: request.query.category_id,
      person_id: request.query.person_id,
      year: request.query.year
    }
  }).then(votes => {
    if (votes.length > 1) {
      return response.error("Multiple votes found!")
    } else if (votes.length === 1) {
      return response.json(votes[0].dataValues);
    } else {
      return response.json({});
    }
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
      vote.update({nomination_id: request.body.nomination_id})
        .then(result => {
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
          return response.json(result);
        })
        .catch(err => {
          response.send(500, "Error submitting vote!");
          throw new Error(err);
        });
    }
  });
};