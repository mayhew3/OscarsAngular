const model = require('./model');
const _ = require('underscore');

exports.addOrUpdateWinner = function(request, response) {
  model.Winner.findAll({
    where: {
      category_id: request.body.category_id,
      year: request.body.year
    }
  }).then(winners => {
    if (winners.length > 1) {
      response.send(500, "Multiple winners found!");
      throw new Error("Multiple winners found!");
    } else if (winners.length === 1) {
      let winner = winners[0];
      winner.update({nomination_id: request.body.nomination_id})
        .then(result => {
          return response.json(result);
        })
        .catch(err => {
          response.send(500, "Error updating existing winner!");
          throw new Error(err);
        });
    } else {
      model.Winner
        .create(request.body)
        .then(result => {
          return response.json(result);
        })
        .catch(err => {
          response.send(500, "Error submitting winner!");
          throw new Error(err);
        });
    }
  });
};
