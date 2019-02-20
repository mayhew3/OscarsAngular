import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {Injectable} from '@angular/core';
import {_} from 'underscore';
import {MockCategoryList} from './data/categories.mock';
import {MockPersonList} from './data/persons.mock';
import {MockVoteList} from './data/votes.mock';
import {Vote} from '../interfaces/Vote';
import {Observable} from 'rxjs';
import {MockSystemVars} from './data/system.vars.mock';

@Injectable({
  providedIn: 'root',
})

export class InMemoryDataService implements InMemoryDbService {
  // tslint:disable-next-line
  categories = MockCategoryList;
  persons = MockPersonList;
  votes = MockVoteList;
  systemVars = MockSystemVars;

  /////////// helpers ///////////////

  private static finishOptions(options: ResponseOptions, {headers, url}: RequestInfo) {
    options.statusText = getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }

  createDb(): {} {
    // Need an empty nominees list so the service knows the collection exists.
    return {
      categories: this.categories,
      nominees: [],
      persons: this.persons,
      votes: this.votes,
      systemVars: this.systemVars};
  }

  get(requestInfo: RequestInfo) {
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'votes') {
      return this.getVote(requestInfo);
    } else if (collectionName === 'categories') {
      return this.getCategoriesWithVotes(requestInfo);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  put(requestInfo: RequestInfo) {
    console.log('HTTP override: PUT');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'nominees') {
      this.updateNomination(requestInfo);
    }
    return undefined;
  }

  post(requestInfo: RequestInfo) {
    if (requestInfo.collectionName === 'votes') {
      const existingVote = this.existingVote(requestInfo);
      if (existingVote) {
        return this.updateVote(requestInfo, existingVote);
      }
    }
    return undefined;
  }

  private getVote(requestInfo: RequestInfo): Observable<any> {
    return requestInfo.utils.createResponse$(() => {
      console.log('HTTP GET override');

      const dataEncapsulation = requestInfo.utils.getConfig().dataEncapsulation;

      const entries = requestInfo.query.entries();
      const category_id = entries.next().value[1][0];
      const person_id = entries.next().value[1][0];
      const year = entries.next().value[1][0];

      // tslint:disable-next-line:triple-equals
      const data = _.findWhere(requestInfo.collection, {
        category_id: +category_id,
        person_id: +person_id,
        year: +year
      });

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
