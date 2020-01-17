const model = require('./model');
const events = require('./events_controller');
const socket = require('./sockets_controller');
const _ = require('underscore');

exports.addOrDeleteWinner = function(request, response) {
  model.Winner.findOne({
    where: {
      nomination_id: request.body.nomination_id
    }
  }).then(winner => {
    if (winner) {
      winner.destroy()
        .then(() => {
          const msg = {
            detail: 'delete',
            nomination_id: request.body.nomination_id
          };
          socket.emitToAll('winner', msg);
          response.json({msg: 'Success'});
        })
        .catch(err => {
          response.send(500, "Error deleting existing winner!");
          throw new Error(err);
        });
    } else {
      model.Winner
        .create(request.body)
        .then(result => {
          const msg = {
            detail: 'add',
            nomination_id: request.body.nomination_id,
            winner_id: result.id,
            declared: result.declared
          };
          socket.emitToAll('winner', msg);
          response.json({msg: 'Success'});
        })
        .catch(err => {
          response.send(500, "Error submitting winner!");
          throw new Error(err);
        });
    }
  });
};
