import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {ActivatedRoute, Params} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import * as _ from 'underscore';
import {ActiveContext} from '../categories.context';
import {VotesService} from '../../services/votes.service';
import {Vote} from '../../interfaces/Vote';
import {Person} from '../../interfaces/Person';
import {WinnersService} from '../../services/winners.service';
import {PersonService} from '../../services/person.service';
import {SystemVarsService} from '../../services/system.vars.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'osc-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  public category: Category;
  public nextCategory: Category;
  public previousCategory: Category;
  public nominees: Nominee[];
  public votedNominee: Nominee;
  public winningNominees: Nominee[] = [];
  private processingPick: Nominee;
  private person: Person;
  private persons: Person[];
  @Input() activeContext: ActiveContext;

  constructor(private categoryService: CategoryService,
              private votesService: VotesService,
              private route: ActivatedRoute,
              private winnersService: WinnersService,
              private personService: PersonService,
              private systemVarsService: SystemVarsService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const category_id = +params.category_id;
      this.personService.me$.subscribe(person => {
        this.person = person;
        this.categoryService.getNominees(category_id)
          .subscribe(nominees => {
            this.nominees = nominees;
          });
        this.categoryService.getCategory(category_id)
          .subscribe(category => this.category = category);
        this.categoryService.getNextCategory(category_id)
          .subscribe(category => this.nextCategory = category);
        this.categoryService.getPreviousCategory(category_id)
          .subscribe(category => this.previousCategory = category);

        if (this.votingMode()) {
          this.votedNominee = _.findWhere(this.nominees, {
            id: this.category.voted_on
          });
        }
        if (this.winnersMode()) {
          this.updateLocalWinningNominees();
          this.personService.getPersonsForGroup(1).subscribe(persons => {
            this.persons = persons;
            this.categoryService.subscribeToWinnerEvents().subscribe(() => {
              this.updateLocalWinningNominees();
              this.processingPick = undefined;
            });
          });
        }
      });
    });
  }

  getNominees(): Nominee[] {
    return this.nominees ? this.nominees.sort((nominee1, nominee2) => {
      return nominee1.nominee < nominee2.nominee ? -1 : 1;
    }) : [];
  }

  personsForNominee(nominee: Nominee): Observable<Person[]> {
    return this.votesService.getVotesForCurrentYearAndCategory(this.category).pipe(
      map(votes => {
        const votesForNominee = _.where(votes, {nomination_id: nominee.id});
        return _.map(votesForNominee, vote => _.findWhere(this.persons, {id: vote.person_id}));
      })
    );
  }

  private updateLocalWinningNominees(): void {
    const winners = this.category.winners;
    // noinspection TypeScriptValidateJSTypes
    this.winningNominees = _.map(winners, winner => {
      const nomination_id = winner.nomination_id;
      return _.findWhere(this.nominees, {id: nomination_id});
    });
  }

  getVoterClass(person: Person): Observable<string> {
    return this.personService.isMe(person).pipe(
      map(isMe => !!isMe ? 'itsMe' : '')
    );
  }

  submitVoteOrWinner(nominee: Nominee): void {
    if (this.votingMode()) {
      this.processingPick = nominee;
      this.votesService.addOrUpdateVote(nominee, this.person).subscribe((vote: Vote) => {
        // todo: MA-40 - this sucks, better way to check for error response.
        if (vote && vote.id) {
          this.votedNominee = nominee;
          this.category.voted_on = nominee.id;
        }
        this.processingPick = undefined;
      });
    } else if (this.winnersMode() && this.personService.isAdmin) {
      this.processingPick = nominee;
      this.winnersService.addOrDeleteWinner(nominee).subscribe();
    }
  }

  getHeaderText(): string {
    return this.category ? this.categoryService.getCategoryName(this.category) : '';
  }

  getHeaderSubtitle(): string {
    return this.category ? this.categoryService.getCategorySubtitle(this.category) : '';
  }

  getHeaderPts(): string {
    return this.category ? this.category.points.toString() : '';
  }

  showNominees(): Observable<boolean> {
    return this.systemVarsService.canVote().pipe(
      map(canVote => !this.stillLoading() && (canVote || !this.votingMode()))
    );
  }

  showVotingClosedMessage(): boolean {
    return !this.stillLoading() &&
      this.votingMode() && !this.systemVarsService.canVote();
  }

  stillLoading(): boolean {
    return this.categoryService.stillLoading() || this.personService.stillLoading() || this.systemVarsService.stillLoading();
  }

  getMainLineText(nominee: Nominee): string {
    return nominee.nominee;
  }

  getSubtitleText(nominee: Nominee): string {
    return Nominee.getSubtitleText(this.category, nominee);
  }

  getSongSubtitles(nominee: Nominee): string[] {
    return nominee.detail.split('; ');
  }

  isVoted(nominee: Nominee): boolean {
    return this.votedNominee && this.votedNominee.id === nominee.id;
  }

  showSubtitleText(nominee: Nominee): boolean {
    return !!nominee.context && !Nominee.isSongCategory(this.category.name);
  }

  showSongSubtitle(nominee: Nominee): boolean {
    return !!nominee.context && Nominee.isSongCategory(this.category.name);
  }

  getVotedClass(nominee: Nominee): string {
    const classes = [];

    if (this.processingPick && this.processingPick.id === nominee.id) {
      classes.push('processing');
    } else if (this.votingMode() && this.isVoted(nominee)) {
      classes.push('votedOn');
    } else if (this.winnersMode() && this.isWinner(nominee)) {
      classes.push('winner');
    }

    if (this.personService.isAdmin || this.votingMode()) {
      classes.push('fakeLink');
    }

    return classes.join(' ');
  }

  isWinner(nominee: Nominee): boolean {
    return this.winningNominees && this.winningNominees.includes(nominee);
  }

  votingMode(): boolean {
    return ActiveContext.Vote === this.activeContext;
  }

  winnersMode(): boolean {
    return ActiveContext.Winner === this.activeContext;
  }

  oddsMode(): boolean {
    return ActiveContext.OddsAssignment === this.activeContext;
  }

}
