import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {AddWinner, RemoveWinner, ResetWinners} from '../actions/category.action';
import {AddVote, ChangeVote, UnVote} from '../actions/votes.action';
import {ChangeActiveCeremonyYear} from '../actions/systemVars.action';
import {OddsInProgress, UpdatePlayerOdds} from '../actions/odds.action';
import {Store} from '@ngxs/store';
import _ from 'underscore';
import {LoggerService} from './logger.service';
import {PersonConnected, PersonDisconnected} from '../actions/person.action';
import {AddCeremonyYear, VotingLock, VotingUnlock} from '../actions/ceremony.action';
import {VotingLockedMessage} from '../../shared/messages/VotingLockedMessage';
import {VotingUnlockedMessage} from '../../shared/messages/VotingUnlockedMessage';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  listenersInitialized = false;

  constructor(private socket: SocketService,
              private store: Store,
              private logger: LoggerService) {
    this.maybeInitListeners();
  }

  private addSingleActionListener(channelName: string, createAction: (msg: any) => any): void {
    this.addListener(channelName, msg => [createAction(msg)]);
  }

  private addListener(channelName: string, createActions: (msg: any) => any[]): void {
    this.socket.on(channelName, msg => {
      this.logger.log(`Received ${channelName} message: ${JSON.stringify(msg)}`);
      const actions = createActions(msg);
      _.each(actions, action => this.store.dispatch(action));
    });
  }

  private maybeInitListeners(): void {
    if (!this.listenersInitialized) {

      this.addListener('add_winner', msg => [
        new AddWinner(msg.nomination_id, msg.winner_id, new Date(msg.declared)),
        new OddsInProgress()
      ]);
      this.addListener('remove_winner', msg => [
        new RemoveWinner(msg.winner_id),
        new OddsInProgress()
      ]);
      this.addListener('reset_winners', msg => [
        new ResetWinners(msg.year),
        new OddsInProgress()
      ]);

      this.addSingleActionListener('add_vote', msg => new AddVote(msg.id, msg.category_id, msg.year, msg.person_id, msg.nomination_id));
      this.addSingleActionListener('change_vote', msg => new ChangeVote(msg.vote_id, msg.nomination_id));
      this.addSingleActionListener('unvote', msg => new UnVote(msg.vote_id));
      this.addSingleActionListener('voting_locked', (msg: VotingLockedMessage) => new VotingLock(msg.ceremony_year_id, msg.voting_closed));
      this.addSingleActionListener('voting_unlocked', (msg: VotingUnlockedMessage) => new VotingUnlock(msg.ceremony_year_id));
      this.addSingleActionListener('odds', msg => new UpdatePlayerOdds(msg));
      this.addSingleActionListener('person_connected', msg => new PersonConnected(msg.person_id));
      this.addSingleActionListener('person_disconnected', msg => new PersonDisconnected(msg.person_id));
      this.addSingleActionListener('add_ceremony_year', msg => new AddCeremonyYear(msg));
      this.addSingleActionListener('active_ceremony_changed', msg => new ChangeActiveCeremonyYear(msg.ceremony_year_id, msg.year, msg.ceremony_name, msg.ceremony_id, msg.voting_open, msg.ceremony_start));

      this.listenersInitialized = true;
    }
  }

}
