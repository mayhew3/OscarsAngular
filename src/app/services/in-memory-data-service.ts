import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import {MockCategoryList} from './data/categories.mock';
import {MockPersonList} from './data/persons.mock';
import {MockVoteList} from './data/votes.mock';
import {Observable} from 'rxjs';
import {MockSystemVars} from './data/system.vars.mock';
import {MockWinnerList} from './data/winners.mock';
import {MockEvents} from './data/event.mock';
import {MockOdds} from './data/odds.mock';
import {MockFinalResultsList} from './data/finalresults.mock';
import {Category} from '../interfaces/Category';
import {InMemoryCallbacksService} from './in-memory-callbacks.service';
import {ArrayUtil} from '../utility/ArrayUtil';
import {Nominee} from '../interfaces/Nominee';
import {LoggerService} from './logger.service';
import {Winner} from '../interfaces/Winner';

@Injectable({
  providedIn: 'root',
})

export class InMemoryDataService implements InMemoryDbService {
  // eslint-disable-next-line
  categories = MockCategoryList;
  persons = MockPersonList;
  votes = MockVoteList;
  systemVars = MockSystemVars;
  winners = MockWinnerList;
  events = MockEvents;
  odds = MockOdds;
  finalResults = MockFinalResultsList;

  /////////// helpers ///////////////

  constructor(private callbackService: InMemoryCallbacksService,
              private logger: LoggerService) {
  }

  private static finishOptions(options: ResponseOptions, {headers, url}: RequestInfo): ResponseOptions {
    options.statusText = getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }

  createDb(): Record<string, unknown> {
    // Need an empty nominees list so the service knows the collection exists.
    return {
      categories: this.categories,
      nominees: [],
      persons: this.persons,
      votes: this.votes,
      systemVars: this.systemVars,
      winners: this.winners,
      events: this.events,
      odds: this.odds,
      finalResults: this.finalResults,
      oddsChange: [],
      resetWinners: [],
    };
  }

  /* SOCKET METHODS */

  on(channel, callback): void {
    this.callbackService.on(channel, callback);
  }

  off(channel, callback): void {
    this.callbackService.off(channel, callback);
  }

  getCallbacks(channel): any[] {
    return this.callbackService.getCallbacks(channel);
  }

  broadcastToChannel(channel, msg): void {
    const callbacks = this.getCallbacks(channel);
    _.forEach(callbacks, callback => callback(msg));
  }

  get(requestInfo: RequestInfo): Observable<Response> {
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'categories') {
      return this.getCategoriesWithVotes(requestInfo);
    } else if (collectionName === 'events') {
      return this.getEventsSinceDate(requestInfo);
    } else if (collectionName === 'maxYear') {
      return this.getMaxYear(requestInfo);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  put(requestInfo: RequestInfo): Observable<Response> {
    this.logger.log('HTTP override: PUT');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'nominees') {
      this.updateNomination(requestInfo);
    } else if (collectionName === 'systemVars') {
      this.updateSystemVars(requestInfo);
    } else if (collectionName === 'oddsChange') {
      return this.updateOdds(requestInfo);
    } else if (collectionName === 'resetWinners') {
      return this.deleteWinners(requestInfo);
    }
    return undefined;
  }

  post(requestInfo: RequestInfo): Observable<Response> {
    if (requestInfo.collectionName === 'votes') {
      return this.addOrChangeVote(requestInfo);
    } else if (requestInfo.collectionName === 'winners') {
      this.addWinner(requestInfo);
    }
    return undefined;
  }

  delete(requestInfo: RequestInfo): Observable<Response> {
    if (requestInfo.collectionName === 'winners') {
      this.removeWinner(requestInfo);
    }
    return undefined;
  }

  private deleteWinners(requestInfo: RequestInfo): Observable<Response> {
    const year = this.getBody(requestInfo).year;

    _.forEach(this.categories, category => {
      const winners = ArrayUtil.cloneArray(category.winners);
      _.forEach(winners, (winner: any) => {
        if (winner.year === year) {
          ArrayUtil.removeFromArray(winners, winner);
        }
      });
    });

    const socketMsg = {
      event_id: 1,
      event_time: new Date(),
      year
    };

    this.broadcastToChannel('reset_winners', socketMsg);

    this.sendUpdatedOdds();

    return this.packageUpResponse({msg: 'Success!'}, requestInfo);
  }

  private updateSystemVars(requestInfo: RequestInfo): void {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    const systemVars = this.systemVars[0];

    if (jsonBody.voting_open !== undefined) {
      systemVars.voting_open = jsonBody.voting_open;

      const msg = {
        event_id: 1,
        event_time: new Date()
      };

      if (!systemVars.voting_open) {
        this.broadcastToChannel('voting_locked', msg);
      } else {
        this.broadcastToChannel('voting_unlocked', msg);
      }
    }
  }

  private addOrChangeVote(requestInfo: RequestInfo): Observable<Response> {
    const body = this.getBody(requestInfo);

    const existing = _.findWhere(this.votes, {
      category_id: body.category_id,
      year: body.year,
      person_id: body.person_id
    });

    if (!!existing) {
      existing.nomination_id = body.nomination_id;
      const msg = {
        vote_id: existing.id,
        nomination_id: body.nomination_id
      };
      this.broadcastToChannel('change_vote', msg);

      return this.packageUpResponse({msg: 'Success!'}, requestInfo);

    } else {
      const vote_id = this.genVoteId();
      const vote = {
        id: vote_id,
        category_id: body.category_id,
        year: body.year,
        person_id: body.person_id,
        nomination_id: body.nomination_id
      };
      this.votes.push(vote);
      this.broadcastToChannel('add_vote', vote);

      return this.packageUpResponse(vote, requestInfo);
    }
  }

  private addWinner(requestInfo: RequestInfo): void {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);

    const categoryForNominee = this.categoryForNominee(jsonBody.nomination_id);
    jsonBody.id = this.genWinnerId();
    categoryForNominee.winners.push(jsonBody);
    const socketMsg = {
      nomination_id: jsonBody.nomination_id,
      event_id: 1,
      event_time: new Date(),
      winner_id: jsonBody.id,
      declared: new Date(),
    };

    this.broadcastToChannel('add_winner', socketMsg);

    this.sendUpdatedOdds();
  }

  private logReadOnly(): void {
    let readOnly = 0;
    let writeable = 0;
    _.chain(this.categories)
      .map(c => c.nominees)
      .flatten()
      .each(n => {
        if (Object.getOwnPropertyDescriptor(n, 'nominee').writable) {
          writeable++;
        } else {
          readOnly++;
        }
      });
    this.logger.log(`Read-only: ${readOnly}, Writeable: ${writeable}`);
  }

  private updateOdds(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    const changes = jsonBody.changes;

    this.logReadOnly();

    _.each(changes, change => {
      const nominee = this.findNominee(change.nomination_id);
      nominee.odds_numerator = change.odds_numerator;
      nominee.odds_denominator = change.odds_denominator;
      nominee.odds_expert = change.odds_expert;
      nominee.odds_user = change.odds_user;
    });

    return this.packageUpResponse({msg: 'Success!'}, requestInfo);
  }

  private removeWinner(requestInfo: RequestInfo): void {
    const winner_id = requestInfo.id;

    const categoryForExistingWinner = this.existingCategoryForWinnerID(winner_id);
    const winner = _.findWhere(categoryForExistingWinner.winners, {id: winner_id});
    ArrayUtil.removeFromArray(categoryForExistingWinner.winners, winner);

    const socketMsg = {
      nomination_id: winner.nomination_id,
      event_id: 1,
      event_time: new Date(),
      winner_id: winner.id
    };

    this.broadcastToChannel('remove_winner', socketMsg);

    this.sendUpdatedOdds();
  }

  private sendUpdatedOdds(): void {
    const voters = this.getVoters();
    const odds_results = _.map(voters, voter => ({
        id: 1,
        person_id: voter,
        odds: Math.random(),
      }));
    const odds_execution = {
      id: 1,
      event_id: 1,
      odds: odds_results,
    };
    this.broadcastToChannel('odds', odds_execution);
  }

  private getVoters(): number[] {
    const fullList = _.map(this.votes, vote => vote.person_id);
    return _.uniq(fullList);
  }

  // noinspection JSMethodCanBeStatic
  private createNomineeCopy(nominee): Nominee {
    return {
      id: nominee.id,
      nominee: nominee.nominee,
      context: nominee.context,
      detail: nominee.detail,
      category_id: nominee.category_id,
      year: nominee.year,
      odds_expert: nominee.odds_expert,
      odds_user: nominee.odds_user,
      odds_numerator: nominee.odds_numerator,
      odds_denominator: nominee.odds_denominator,
    };
  }

  // noinspection JSMethodCanBeStatic
  private createWinnerCopy(winner): Winner {
    return {
      category_id: winner.category_id,
      declared: winner.declared,
      nomination_id: winner.nomination_id,
      year: winner.year,
      id: winner.id
    };
  }

  private getCategoriesWithVotes(requestInfo: RequestInfo): Observable<Response> {
    this.logger.log('HTTP GET override');

    const person_id = requestInfo.query.get('person_id')[0];
    const year = requestInfo.query.get('year')[0];

    const data = [];

    _.forEach(requestInfo.collection, category => {
      const yearNum = +year;
      const personIDNum = +person_id;
      const copyCategory: Category = {
        id: category.id,
        name: category.name,
        points: category.points,
        nominees: _.chain(category.nominees)
          .where({year: yearNum})
          .map(this.createNomineeCopy)
          .value(),
        voted_on: this.getVoteForCategory(category.id, personIDNum, yearNum),
        winners: _.chain(category.winners)
          .where({year: yearNum})
          .map(this.createWinnerCopy)
          .value()
      };
      data.push(copyCategory);
    });

    return this.packageUpResponse(data, requestInfo);
  }

  private getMaxYear(requestInfo: RequestInfo): Observable<Response> {
    this.logger.log('HTTP GET override');

    const maxYear = _.max(_.map(this.categories, category => _.max(_.map(category.nominees, nominee => nominee.year))));
    const data = [{maxYear}];

    return this.packageUpResponse(data, requestInfo);
  }

  private getEventsSinceDate(requestInfo: RequestInfo): Observable<Response> {
    this.logger.log('HTTP GET override');

    const entries = requestInfo.query.entries();
    const since_date = entries.next().value[1][0];

    const data = requestInfo.collection;
    // const data = _.filter(requestInfo.collection, event => event.event_time > since_date);

    return this.packageUpResponse(data, requestInfo);
  }

  private getVoteForCategory(category_id: number, person_id: number, year: number): number {
    const existingVote = _.findWhere(this.votes, {
      category_id,
      person_id,
      year
    });
    return existingVote ? existingVote.nomination_id : undefined;
  }

  private genWinnerId(): number {
    const winners = _.flatten(_.map(this.categories, c => c.winners));
    if (winners.length === 0) {
      return 1;
    } else {
      return _.max(_.map(winners, w => w.id)) + 1;
    }
  }

  private genVoteId(): number {
    if (this.votes.length === 0) {
      return 1;
    } else {
      return _.max(_.map(this.votes, w => w.id)) + 1;
    }
  }

  private updateNomination(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    this.updateObject(jsonBody);

    const options: ResponseOptions = {
      body: {msg: 'Success!'},
      status: STATUS.OK
    };

    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

  private existingCategoryForWinnerID(winner_id: number): Category {
    const results = _.filter(this.categories, category => !!_.findWhere(category.winners, {id: winner_id}));
    return _.first(results);
  }

  private findNominee(nomination_id: number): Nominee {
    return _.chain(this.categories)
      .map(category => category.nominees)
      .flatten()
      .findWhere({id: nomination_id})
      .value();
  }

  private categoryForNominee(nomination_id: number): Category {
    const results = _.filter(this.categories, category => !!_.findWhere(category.nominees, {id: nomination_id}));
    return _.first(results);
  }

  private updateObject(jsonBody: any): void {
    const id = jsonBody.id;
    const odds_expert = jsonBody.odds_expert;

    _.forEach(this.categories, category => {
      _.forEach(category.nominees, nominee => {
        if (nominee.id === id) {
          nominee.odds_expert = odds_expert;
        }
      });
    });
  }

  // noinspection JSMethodCanBeStatic
  private getBody(requestInfo): any {
    return requestInfo.utils.getJsonBody(requestInfo.req);
  }

  private packageUpResponse(body, requestInfo): Observable<Response> {
    const options: ResponseOptions = {
      body,
      status: STATUS.OK
    };
    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

}
