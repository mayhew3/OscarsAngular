import {NextFunction, Request, Response} from 'express/ts4.0';
import ServerError from './ServerError';

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

  type ApiCallback = (request: Request, response: Response) => Promise<void>;
  type ApiNextCallback = (request: Request, response: Response, next: NextFunction) => Promise<void>;

  const errorWrapCallback: (callback: ApiCallback) => ApiNextCallback = (callback: ApiCallback) => {
    return (request: Request, response: Response, next: NextFunction) => {
      return callback(request, response).catch(err => {
        next(err);
      });
    };
  };

  const publicGet: (endpoint: any, callback: ApiCallback) => void = (endpoint, callback) => {
    router.get(endpoint, errorWrapCallback(callback));
  };

  const privateGet: (endpoint: any, callback: ApiCallback) => void = (endpoint, callback) => {
    router.get(endpoint, authCheck, errorWrapCallback(callback));
  };

  const privatePost: (endpoint: any, callback: ApiCallback) => void = (endpoint, callback) => {
    router.post(endpoint, authCheck, errorWrapCallback(callback));
  };

  const privatePut: (endpoint: any, callback: ApiCallback) => void = (endpoint, callback) => {
    router.put(endpoint, authCheck, errorWrapCallback(callback));
  };

  const privateDelete: (endpoint: any, callback: ApiCallback) => void = (endpoint, callback) => {
    router.delete(endpoint, authCheck, errorWrapCallback(callback));
  };

  // noinspection JSUnusedLocalSymbols
  const privatePatch: (endpoint: any, callback: ApiCallback) => void = (endpoint, callback) => {
    router.patch(endpoint, authCheck, errorWrapCallback(callback));
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
  // app.get('/api/winners', winners.addWinner);
  privateDelete('/winners/:id', winners.deleteWinner);
  privatePut('/resetWinners', winners.resetWinners);

  publicGet('/systemVars', systemVars.getSystemVars);
  privatePut('/systemVars', systemVars.updateSystemVars);

  privateGet('/finalResults', finalResults.getFinalResults);
  privateGet('/maxYear', nominees.getMostRecentYear);

  publicGet('/ceremonies', ceremonies.getCeremonyYears);
  privatePost('/ceremonies', ceremonies.addCeremonyYear);
  privatePut('/ceremonies', ceremonies.updateCeremonyYear);

  app.use('/api', router);

  // error handlers

  // production error handler
  // no stacktraces leaked to user
  // noinspection JSUnusedLocalSymbols
  router.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
    console.log(err.message);
    console.log(err.stack);
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
    next(err);
  });

  // noinspection JSUnusedLocalSymbols
  router.use((req: Request, res: Response, next: NextFunction) => {
    const message = `Invalid API called: ${req.path}`;
    const status = 404;
    console.log(message);
    res.status(status).json({message});
    next(new ServerError(status, message));
  });

};
