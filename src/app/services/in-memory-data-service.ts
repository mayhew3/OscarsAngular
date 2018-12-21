import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {Injectable} from '@angular/core';
import {_} from 'underscore';
import {MockCategoryList} from './categories.mock';

@Injectable({
  providedIn: 'root',
})

export class InMemoryDataService implements InMemoryDbService {
  // tslint:disable-next-line
  categories = MockCategoryList;

  /////////// helpers ///////////////

  private static finishOptions(options: ResponseOptions, {headers, url}: RequestInfo) {
    options.statusText = getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }

  createDb(): {} {
    // Need an empty nominees list so the service knows the collection exists.
    return {categories: this.categories, nominees: []};
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
