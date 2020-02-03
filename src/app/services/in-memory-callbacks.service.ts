import { Injectable } from '@angular/core';
import {_} from 'underscore';

@Injectable()
export class InMemoryCallbacksService {

  winnerCallbacks = [];
  votingOpenCallbacks = [];
  oddsCallbacks = [];
  itsOverCallbacks = [];

  on(channel, callback) {
    if (channel === 'winner') {
      this.winnerCallbacks.push(callback);
    } else if (channel === 'voting') {
      this.votingOpenCallbacks.push(callback);
    } else if (channel === 'odds') {
      this.oddsCallbacks.push(callback);
    } else if (channel === 'its_over') {
      this.itsOverCallbacks.push(callback);
    }
  }

  removeCallback(channel, callback) {
    if (channel === 'winner') {
      this.winnerCallbacks = _.without(this.winnerCallbacks, callback);
    } else if (channel === 'voting') {
      this.votingOpenCallbacks = _.without(this.votingOpenCallbacks, callback);
    } else if (channel === 'odds') {
      this.oddsCallbacks = _.without(this.oddsCallbacks, callback);
    } else if (channel === 'its_over') {
      this.itsOverCallbacks = _.without(this.itsOverCallbacks, callback);
    }
  }

  getCallbacks(channel) {
    if (channel === 'winner') {
      return this.winnerCallbacks;
    } else if (channel === 'voting') {
      return this.votingOpenCallbacks;
    } else if (channel === 'odds') {
      return this.oddsCallbacks;
    } else if (channel === 'its_over') {
      return this.itsOverCallbacks;
    }
  }
}
