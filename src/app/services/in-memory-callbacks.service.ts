import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import {ArrayUtil} from '../utility/ArrayUtil';

@Injectable()
export class InMemoryCallbacksService {

  private _channelCallbacks = new Map<string, any[]>();

  on(channel, callback): void {
    this.getCallbacks(channel).push(callback);
  }

  removeCallback(channel, callback): void {
    const callbacks = this._channelCallbacks.get(channel);
    ArrayUtil.removeFromArray(callbacks, callback);
  }

  getCallbacks(channel): any[] {
    const existing = this._channelCallbacks.get(channel);
    if (!existing) {
      const callbacks = [];
      this._channelCallbacks.set(channel, callbacks);
      return callbacks;
    } else {
      return existing;
    }
  }
}
