const express = require('express');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
module.exports = app => {
  const events = require('./controllers/events_controller');
  const nominees = require('./controllers/nominees_controller');
  const odds = require('./controllers/odds_controller');
  const persons = require('./controllers/persons_controller');
  const votes = require('./controllers/votes_controller');
  const winners = require('./controllers/winners_controller');
  const systemVars = require('./controllers/systemvars_controller');
  const finalResults = require('./controllers/final_results_controller');
  const ceremonies = require('./controllers/ceremony_controller');

  const authConfig = {
    domain: 'mayhew3.auth0.com',
    audience: 'https://oscars.v2.mayhew3.com/'
  };

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

  const router = express.Router();

  const privateGet: (endpoint: any, callback: any) => void = (endpoint, callback) => {
    router.get(endpoint, authCheck, callback);
  };

  const privatePost: (endpoint: any, callback: any) => void = (endpoint, callback) => {
    router.post(endpoint, authCheck, callback);
  };

  const privatePut: (endpoint: any, callback: any) => void = (endpoint, callback) => {
    router.put(endpoint, authCheck, callback);
  };

  const privateDelete: (endpoint: any, callback: any) => void = (endpoint, callback) => {
    router.delete(endpoint, authCheck, callback);
  };

  // noinspection JSUnusedLocalSymbols
  const privatePatch: (endpoint: any, callback: any) => void = (endpoint, callback) => {
    router.patch(endpoint, authCheck, callback);
  };

  privateGet('/categories', nominees.getCategories);
  privateGet('/events', events.getRecentEvents);
  privatePut('/nominees', nominees.updateNomination);
  privateGet('/odds', odds.getMostRecentOddsBundle);

  privatePut('/oddsChange', odds.updateOddsForNominees);

  privateGet('/persons', persons.getPersons);
  privatePut('/persons', persons.updatePerson);
  privateGet('/personGroups', persons.getPersonGroups);

  privateGet('/votes', votes.getVotes);
  privatePost('/votes', votes.addOrUpdateVote);

  privatePost('/winners', winners.addWinner);
  privateDelete('/winners/:id', winners.deleteWinner);
  privatePut('/resetWinners', winners.resetWinners);

  privateGet('/systemVars', systemVars.getSystemVars);
  privatePut('/systemVars', systemVars.updateSystemVars);

  privateGet('/finalResults', finalResults.getFinalResults);
  privateGet('/maxYear', nominees.getMostRecentYear);

  privateGet('/ceremonies', ceremonies.getCeremonyYears);
  privatePost('/ceremonies', ceremonies.addCeremonyYear);

  // error handlers

  // production error handler
  // no stacktraces leaked to user
  // noinspection JSUnusedLocalSymbols
  app.use((err, req, res, next) => {
    console.log(err.message);
    console.log(err.stack);
    console.log('Status: ' + err.status);
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });

  // noinspection JSUnusedLocalSymbols
  router.use((req, res, next) => {
    console.log('Undefined API called!');
    res.status(400).json({
      message: `Invalid API called: ${req.path}`,
    });
  });

  app.use('/api', router);

};
