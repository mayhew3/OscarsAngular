let express = require('express');

module.exports = function(app) {
  let events = require('../controllers/events_controller');
  let nominees = require('../controllers/nominees_controller');
  let odds = require('../controllers/odds_controller');
  let persons = require('../controllers/persons_controller');
  let votes = require('../controllers/votes_controller');
  let winners = require('../controllers/winners_controller');
  let systemVars = require('../controllers/systemvars_controller');
  let finalResults = require('../controllers/final_results_controller');

  let router = express.Router();

  router.route('/categories')
    .get(nominees.getCategories);

  router.route('/events')
    .get(events.getRecentEvents);

  router.route('/nominees')
    .put(nominees.updateNomination);

  router.route('/odds')
    .get(odds.getMostRecentOddsBundle);

  router.route('/persons')
    .get(persons.getPersons)
    .put(persons.updatePerson);

  router.route('/votes')
    .get(votes.getVotes)
    .post(votes.addOrUpdateVote);

  router.route('/winners')
    .post(winners.addOrDeleteWinner)
    .patch(winners.resetWinners);

  router.route('/systemVars')
    .get(systemVars.getSystemVars)
    .put(systemVars.updateSystemVars);

  router.route('/finalResults')
    .get(finalResults.getFinalResults);

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
