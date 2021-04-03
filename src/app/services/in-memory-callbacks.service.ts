import {Injectable} from '@angular/core';
import {ArrayUtil} from '../utility/ArrayUtil';

@Injectable()
export class InMemoryCallbacksService {

  private channelCallbacks = new Map<string, any[]>();

  on(channel, callback): void {
    this.getCallbacks(channel).push(callback);
  }

  removeCallback(channel, callback): void {
    const callbacks = this.channelCallbacks.get(channel);
    ArrayUtil.removeFromArray(callbacks, callback);
  }

  getCallbacks(channel): any[] {
    const existing = this.channelCallbacks.get(channel);
    if (!existing) {
      const callbacks = [];
      this.channelCallbacks.set(channel, callbacks);
      return callbacks;
    } else {
      return existing;
    }
  }
}
