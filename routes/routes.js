let express = require('express');

module.exports = function(app) {
  let nominees = require('../controllers/nominees_controller');
  let persons = require('../controllers/persons_controller');
  let votes = require('../controllers/votes_controller');
  let winners = require('../controllers/winners_controller');
  let systemVars = require('../controllers/systemvars_controller');

  let router = express.Router();

  router.route('/categories')
    .get(nominees.getCategories);

  router.route('/nominees')
    .put(nominees.updateNomination);

  router.route('/persons')
    .get(persons.getPersons);

  router.route('/votes')
    .get(votes.getVote)
    .post(votes.addOrUpdateVote);

  router.route('/winners')
    .post(winners.addOrUpdateWinner);

  router.route('/systemVars')
    .get(systemVars.getSystemVars);

  app.use('/api', router);

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      console.log(err.message);
      console.log(err.stack);
      console.log("Status: " + err.status);
      res.status(err.status || 500).json({
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    console.log(err.message);
    console.log(err.stack);
    console.log("Status: " + err.status);
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });

};
