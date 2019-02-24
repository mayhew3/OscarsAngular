import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {ActivatedRoute, Params} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {_} from 'underscore';
import {ActiveContext} from '../categories.context';
import {VotesService} from '../../services/votes.service';
import {AuthService} from '../../services/auth/auth.service';
import {Vote} from '../../interfaces/Vote';
import {Person} from '../../interfaces/Person';
import {WinnersService} from '../../services/winners.service';
import {Winner} from '../../interfaces/Winner';
import {PersonService} from '../../services/person.service';

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
              private auth: AuthService,
              private winnersService: WinnersService,
              private personService: PersonService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const category_id = +params['category_id'];
      this.auth.getPerson().subscribe(person => {
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

  personsForNominee(nominee: Nominee): Person[] {
    const votes = this.votesService.getVotesForCurrentYearAndCategory(this.category);
    const votesForNominee = _.where(votes, {nomination_id: nominee.id});
    return _.map(votesForNominee, vote => _.findWhere(this.persons, {id: vote.person_id}));
  }

  private updateLocalWinningNominees(): void {
    const winners = this.category.winners;
    this.winningNominees = _.filter(this.nominees, nominee => winners.includes(nominee.id));
  }

  getVoterClass(person: Person): string {
    return this.auth.isMe(person) ? 'itsMe' : '';
  }

  submitVote(nominee: Nominee): void {
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
    } else if (this.winnersMode() && this.auth.isAdmin()) {
      const deleting = this.isWinner(nominee);
      this.processingPick = nominee;
      this.winnersService.addOrDeleteWinner(nominee).subscribe((winner: Winner) => {
        if (deleting) {
          this.winningNominees = _.without(this.winningNominees, nominee);
          this.category.winners = _.without(this.category.winners, nominee.id);
        } else if (winner && winner.id) {
          this.winningNominees.push(nominee);
          this.category.winners.push(nominee.id);
        }
        this.processingPick = undefined;
      });
    }
  }

  getHeaderText(): string {
    return this.category ? this.category.name : '';
  }

  getMainLineText(nominee: Nominee): string {
    return nominee.nominee;
  }

  getSubtitleText(nominee: Nominee): string {
    const singleLineCategories = ['Best Picture', 'Documentary Feature', 'Documentary Short', 'Short Film (Animated)', 'Short Film (Live Action)', 'Animated Feature'];

    if (singleLineCategories.includes(this.category.name)) {
      return undefined;
    } else if (nominee.nominee === nominee.context) {
      return nominee.detail;
    } else {
      return nominee.context;
    }
  }

  isVoted(nominee: Nominee): boolean {
    return this.votedNominee && this.votedNominee.id === nominee.id;
  }

  getVotedClass(nominee: Nominee): string {
    if (this.processingPick && this.processingPick.id === nominee.id) {
      return 'processing';
    } else if (this.votingMode() && this.isVoted(nominee)) {
      return 'votedOn';
    } else if (this.winnersMode() && this.isWinner(nominee)) {
      return 'winner';
    }
    return '';
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
