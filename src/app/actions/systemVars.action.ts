import {SocketService} from '../services/socket.service';

export class GetSystemVars {
  static readonly type = '[SystemVars] Get';
  constructor(public socket: SocketService) {
  }
}

export class VotingLock {
  static readonly type = '[SystemVars] Voting Lock';
}

export class VotingUnlock {
  static readonly type = '[SystemVars] Voting Unlock';
}

export class ChangeCurrentYear {
  static readonly type = '[SystemVars] Change Current Year';
  constructor(public year: number) {
  }
}
