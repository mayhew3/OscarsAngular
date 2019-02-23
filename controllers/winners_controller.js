const model = require('./model');
const events = require('./events_controller');
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
          events.addEvent('winner', 'delete', request.body.nomination_id, result, response);
        })
        .catch(err => {
          response.send(500, "Error deleting existing winner!");
          throw new Error(err);
        });
    } else {
      model.Winner
        .create(request.body)
        .then(result => {
          events.addEvent('winner', 'add', request.body.nomination_id, result, response);
        })
        .catch(err => {
          response.send(500, "Error submitting winner!");
          throw new Error(err);
        });
    }
  });
};
