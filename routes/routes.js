let express = require('express');
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");

module.exports = function(app) {
  let events = require('../controllers/events_controller');
  let nominees = require('../controllers/nominees_controller');
  let odds = require('../controllers/odds_controller');
  let persons = require('../controllers/persons_controller');
  let votes = require('../controllers/votes_controller');
  let winners = require('../controllers/winners_controller');
  let systemVars = require('../controllers/systemvars_controller');
  let finalResults = require('../controllers/final_results_controller');

  const authConfig = {
    domain: 'mayhew3.auth0.com',
    audience: 'https://oscars.v2.mayhew3.com/'
  }

  const authCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithms: ['RS256']
  });

  let router = express.Router();

  privateGet('/categories', nominees.getCategories);
  privateGet('/events', events.getRecentEvents);
  privatePut('/nominees', nominees.updateNomination);
  privateGet('/odds', odds.getMostRecentOddsBundle);

  privatePut('/oddsChange', odds.updateOddsForNominees);

  privateGet('/persons', persons.getPersons);
  privatePut('/persons', persons.updatePerson);

  privateGet('/votes', votes.getVotes);
  privatePost('/votes', votes.addOrUpdateVote);

  privatePost('/winners', winners.addWinner);
  privateDelete('/winners/:id', winners.deleteWinner);
  privatePatch('/winners', winners.resetWinners);

  privateGet('/systemVars', systemVars.getSystemVars);
  privatePut('/systemVars', systemVars.updateSystemVars);

  privateGet('/finalResults', finalResults.getFinalResults);
  privateGet('/maxYear', nominees.getMostRecentYear);

  app.use('/api', router);

  function privateGet(endpoint, callback) {
    router.get(endpoint, authCheck, callback);
  }

  function privatePost(endpoint, callback) {
    router.post(endpoint, authCheck, callback);
  }

  function privatePut(endpoint, callback) {
    router.put(endpoint, authCheck, callback);
  }

  function privatePatch(endpoint, callback) {
    router.patch(endpoint, authCheck, callback);
  }

  function privateDelete(endpoint, callback) {
    router.delete(endpoint, authCheck, callback);
  }

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
