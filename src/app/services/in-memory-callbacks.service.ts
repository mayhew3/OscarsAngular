import { Injectable } from '@angular/core';
import {_} from 'underscore';

@Injectable()
export class InMemoryCallbacksService {

  winnerCallbacks = [];
  votingOpenCallbacks = [];

  on(channel, callback) {
    if (channel === 'winner') {
      this.winnerCallbacks.push(callback);
    } else if (channel === 'voting') {
      this.votingOpenCallbacks.push(callback);
    }
  }

  removeCallback(channel, callback) {
    if (channel === 'winner') {
      this.winnerCallbacks = _.without(this.winnerCallbacks, callback);
    } else if (channel === 'voting') {
      this.votingOpenCallbacks = _.without(this.votingOpenCallbacks, callback);
    }
  }

  getCallbacks(channel) {
    if (channel === 'winner') {
      return this.winnerCallbacks;
    } else if (channel === 'voting') {
      return this.votingOpenCallbacks;
    }
  }
}
