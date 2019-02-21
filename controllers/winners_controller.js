const model = require('./model');
const _ = require('underscore');

exports.addOrDeleteWinner = function(request, response) {
  model.Winner.findOne({
    where: {
      nomination_id: request.body.nomination_id
    }
  }).then(winner => {
    if (winner) {
      winner.destroy()
        .then(result => {
          return response.json(result);
        })
        .catch(err => {
          response.send(500, "Error deleting existing winner!");
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
