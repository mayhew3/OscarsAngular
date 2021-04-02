import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {AddWinner, RemoveWinner, ResetWinners} from '../actions/category.action';
import {AddVote, ChangeVote} from '../actions/votes.action';
import {VotingLock, VotingUnlock} from '../actions/systemVars.action';
import {UpdatePlayerOdds} from '../actions/odds.action';
import {Store} from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  listenersInitialized = false;

  constructor(private socket: SocketService,
              private store: Store) {
    this.maybeInitListeners();
  }

  private addListener(channelName: string, createAction: (msg: any) => any): void {
    this.socket.on(channelName, msg => {
      console.log(`Received ${channelName} message: ${JSON.stringify(msg)}`);
      this.store.dispatch(createAction(msg));
    });
  }

  private maybeInitListeners(): void {
    if (!this.listenersInitialized) {

      this.addListener('add_winner', msg => new AddWinner(msg.nomination_id, msg.winner_id, msg.declared));
      this.addListener('remove_winner', msg => new RemoveWinner(msg.winner_id));
      this.addListener('reset_winners', msg => new ResetWinners(msg.year));
      this.addListener('add_vote', msg => new AddVote(msg.id, msg.category_id, msg.year, msg.person_id, msg.nomination_id));
      this.addListener('change_vote', msg => new ChangeVote(msg.vote_id, msg.nomination_id));
      this.addListener('voting_locked', () => new VotingLock());
      this.addListener('voting_unlocked', () => new VotingUnlock());
      this.addListener('odds', msg => new UpdatePlayerOdds(msg));

      this.listenersInitialized = true;
    }
  }

}
