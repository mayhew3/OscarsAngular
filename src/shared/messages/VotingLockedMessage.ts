import {VotingUnlockedMessage} from './VotingUnlockedMessage';

export interface VotingLockedMessage extends VotingUnlockedMessage{
  voting_closed: string;
}
