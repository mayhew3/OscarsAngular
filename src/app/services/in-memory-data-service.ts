import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {Injectable} from '@angular/core';
import {_} from 'underscore';
import {MockCategoryList} from './data/categories.mock';
import {MockPersonList} from './data/persons.mock';
import {MockVoteList} from './data/votes.mock';
import {Vote} from '../interfaces/Vote';
import {Event} from '../interfaces/Event';
import {Observable, of} from 'rxjs';
import {MockSystemVars} from './data/system.vars.mock';
import {MockWinnerList} from './data/winners.mock';
import {MockEvents} from './data/event.mock';
import {MockOdds} from './data/odds.mock';
import {MockFinalResultsList} from './data/finalresults.mock';
import {Category} from '../interfaces/Category';
import {InMemoryCallbacksService} from './in-memory-callbacks.service';
import {Person} from '../interfaces/Person';

@Injectable({
  providedIn: 'root',
})

export class InMemoryDataService implements InMemoryDbService {
  // tslint:disable-next-line
  categories = MockCategoryList;
  persons = MockPersonList;
  votes = MockVoteList;
  systemVars = MockSystemVars;
  winners = MockWinnerList;
  events = MockEvents;
  odds = MockOdds;
  finalResults = MockFinalResultsList;

  /////////// helpers ///////////////

  private static finishOptions(options: ResponseOptions, {headers, url}: RequestInfo) {
    options.statusText = getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }

  constructor(private callbackService: InMemoryCallbacksService) {
  }


  createDb(): {} {
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
      finalResults: this.finalResults
    };
  }

  on(channel, callback) {
    this.callbackService.on(channel, callback);
  }

  removeCallback(channel, callback) {
    this.callbackService.removeCallback(channel, callback);
  }

  getCallbacks(channel) {
    return this.callbackService.getCallbacks(channel);
  }

  get(requestInfo: RequestInfo) {
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'categories') {
      return this.getCategoriesWithVotes(requestInfo);
    } else if (collectionName === 'events') {
      return this.getEventsSinceDate(requestInfo);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  put(requestInfo: RequestInfo) {
    console.log('HTTP override: PUT');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'nominees') {
      this.updateNomination(requestInfo);
    } else if (requestInfo.collectionName === 'systemVars') {
      this.changeVotingOpen(requestInfo);
    }
    return undefined;
  }

  // noinspection JSUnusedGlobalSymbols
  patch(requestInfo: RequestInfo) {
    console.log('HTTP override: PATCH');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'winners') {
      this.deleteWinners();
    }
    return undefined;
  }

  post(requestInfo: RequestInfo) {
    if (requestInfo.collectionName === 'votes') {
      const existingVote = this.existingVote(requestInfo);
      if (existingVote) {
        return this.updateVote(requestInfo, existingVote);
      }
    } else if (requestInfo.collectionName === 'winners') {
      this.addOrDeleteWinner(requestInfo);
    }
    return undefined;
  }

  private deleteWinners() {
    _.forEach(this.categories, category => category.winners = []);

    const socketMsg = {
      detail: 'reset',
      event_id: 1,
      event_time: new Date
    };
    const callbacks = this.getCallbacks('winner');
    _.forEach(callbacks, callback => callback(socketMsg));

    this.sendUpdatedOdds();
  }

  private changeVotingOpen(requestInfo: RequestInfo) {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    const systemVars = this.systemVars[0];
    systemVars.voting_open = jsonBody.voting_open;

    const msg = {
      voting_open: systemVars.voting_open
    };

    const callbacks = this.getCallbacks('voting');
    _.forEach(callbacks, callback => callback(msg));
  }

  private addOrDeleteWinner(requestInfo: RequestInfo) {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    const categoryForExistingWinner = this.existingCategoryForWinner(jsonBody.nomination_id);

    let socketMsg;
    if (!!categoryForExistingWinner) {
      const existingWinner = _.findWhere(categoryForExistingWinner.winners, {nomination_id: jsonBody.nomination_id});
      categoryForExistingWinner.winners = _.without(categoryForExistingWinner.winners, existingWinner);
      socketMsg = {
        detail: 'delete',
        nomination_id: jsonBody.nomination_id,
        event_id: 1,
        event_time: new Date
      };
    } else {
      const categoryForNominee = this.categoryForNominee(jsonBody.nomination_id);
      categoryForNominee.winners.push(jsonBody);
      socketMsg = {
        detail: 'add',
        nomination_id: jsonBody.nomination_id,
        event_id: 1,
        event_time: new Date,
        winner_id: 1234,
        declared: new Date,
      };
    }

    const callbacks = this.getCallbacks('winner');
    _.forEach(callbacks, callback => callback(socketMsg));

    this.sendUpdatedOdds();
  }

  private sendUpdatedOdds(): void {
    const voters = this.getVoters();
    const odds_results = _.map(voters, voter => {
      return {
        id: 1,
        person_id: voter,
        odds: Math.random(),
      };
    });
    const odds_execution = {
      id: 1,
      event_id: 1,
      odds: odds_results,
    };
    _.forEach(this.getCallbacks('odds'), callback => callback(odds_execution));
  }

  private getVoters(): number[] {
    const fullList = _.map(this.votes, vote => vote.person_id);
    return _.uniq(fullList);
  }

  private getCategoriesWithVotes(requestInfo: RequestInfo): Observable<any> {
    return requestInfo.utils.createResponse$(() => {
      console.log('HTTP GET override');

      const dataEncapsulation = requestInfo.utils.getConfig().dataEncapsulation;

      const entries = requestInfo.query.entries();
      const person_id = entries.next().value[1][0];
      const year = entries.next().value[1][0];

      _.forEach(requestInfo.collection, category => {
        category.nominees = _.where(category.nominees, {year: +year});
        category.voted_on = this.getVoteForCategory(category.id, +person_id, +year);
      });

      const data = requestInfo.collection;

      const options: ResponseOptions = data ?
        {
          body: dataEncapsulation ? { data } : data,
          status: STATUS.OK
        } :
        {
          body: dataEncapsulation ? { } : data,
          status: STATUS.OK
        };
      return InMemoryDataService.finishOptions(options, requestInfo);
    });
  }

  private getEventsSinceDate(requestInfo: RequestInfo): Observable<Event[]> {
    return requestInfo.utils.createResponse$(() => {
      console.log('HTTP GET override');

      const dataEncapsulation = requestInfo.utils.getConfig().dataEncapsulation;

      const entries = requestInfo.query.entries();
      const since_date = entries.next().value[1][0];

      const data = requestInfo.collection;
      // const data = _.filter(requestInfo.collection, event => event.event_time > since_date);

      const options: ResponseOptions = data ?
        {
          body: dataEncapsulation ? { data } : data,
          status: STATUS.OK
        } :
        {
          body: dataEncapsulation ? { } : data,
          status: STATUS.OK
        };
      return InMemoryDataService.finishOptions(options, requestInfo);
    });
  }

  private getVoteForCategory(category_id: number, person_id: number, year: number): number {
    const existingVote = _.findWhere(this.votes, {
      category_id: category_id,
      person_id: person_id,
      year: year
    });
    return existingVote ? existingVote.nomination_id : undefined;
  }

  private updateNomination(requestInfo: RequestInfo) {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    this.updateObject(jsonBody);

    const options: ResponseOptions = {
      body: {msg: 'Success!'},
      status: STATUS.OK
    };

    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

  private existingVote(requestInfo: RequestInfo): Vote {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);

    return _.findWhere(this.votes, {
      category_id: jsonBody.category_id,
      person_id: jsonBody.person_id,
      year: jsonBody.year
    });
  }

  private existingCategoryForWinner(nomination_id: number): Category {
    const results = _.filter(this.categories, category => {
      return !!_.findWhere(category.winners, {nomination_id: nomination_id});
    });
    return _.first(results);
  }

  private categoryForNominee(nomination_id: number): Category {
    const results = _.filter(this.categories, category => {
      return !!_.findWhere(category.nominees, {id: nomination_id});
    });
    return _.first(results);
  }

  private updateVote(requestInfo: RequestInfo, existingVote: Vote) {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    existingVote.nomination_id = jsonBody.nomination_id;

    const options: ResponseOptions = {
      body: existingVote,
      status: STATUS.OK
    };

    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

  private updateObject(jsonBody: any) {
    const id = jsonBody.id;
    const odds_expert = jsonBody.odds_expert;

    _.forEach(this.categories, function(category) {
      _.forEach(category.nominees, function(nominee) {
        if (nominee.id === id) {
          nominee.odds_expert = odds_expert;
        }
      });
    });
  }
}
