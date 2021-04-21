import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {ActiveContext} from '../categories.context';
import {SystemVarsService} from '../../services/system.vars.service';
import _ from 'underscore';
import * as moment from 'moment';
import {Winner} from '../../interfaces/Winner';
import {Nominee} from '../../interfaces/Nominee';
import {VotesService} from '../../services/votes.service';
import {Person} from '../../interfaces/Person';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {PersonService} from '../../services/person.service';

@Component({
  selector: 'osc-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  @Input() activeContext: ActiveContext;
  @Input() person: Person;

  me: Person;
  hideWinnerless = false;
  hideWinners = false;

  constructor(private categoryService: CategoryService,
              public systemVarsService: SystemVarsService,
              private votesService: VotesService,
              private personService: PersonService) { }

  ngOnInit(): void {
    this.personService.me$.subscribe(me => {
      this.me = me;
    });
    this.systemVarsService.systemVars.subscribe(systemVars => {
      this.hideWinners = systemVars.hide_winners;
      this.hideWinnerless = systemVars.hide_winnerless;
    });
  }

  get categoriesSorted$(): Observable<Category[]> {
    return this.categoryService.categoriesSorted$;
  }

  getRouterLink(category: Category): any[] {
    if (!this.winnersMode() || this.personIsMe()) {
      return [category.id];
    } else {
      return [];
    }
  }

  getPageTitle(): string {
    if (this.winnersMode() && !this.personIsMe()) {
      return this.getPersonName(this.person);
    } else {
      return this.activeContext;
    }
  }
  getPersonName(person: Person): string {
    if (!!person.middle_name) {
      return person.first_name + ' ' + person.middle_name.charAt(0) + ' ' + person.last_name;
    } else {
      return person.first_name + ' ' + person.last_name;
    }
  }
  toggleShowWinnerless(): void {
    this.systemVarsService.toggleWinnerless();
  }

  toggleShowWinners(): void {
    this.systemVarsService.toggleWinners();
  }

  hideShowLink(hideVar: boolean): string {
    return !hideVar ? '(hide)' : '(show)';
  }

  getCategoriesWithNoWinner$(): Observable<Category[]> {
    return this.categoriesSorted$.pipe(
      map(categories => _.filter(categories, category => category.winners.length === 0))
    );
  }

  getCategoriesWithAtLeastOneWinner$(): Observable<Category[]> {
    return this.categoriesSorted$.pipe(
      map(categories => _.filter(categories, category => category.winners.length > 0))
    );
  }

  getTimeAgo(category: Category): string {
    const winDate = this.mostRecentWinDate(category);
    if (!!winDate) {
      return moment(winDate).fromNow();
    } else {
      return undefined;
    }
  }

  getWinnerName(winner: Winner): Observable<string> {
    return this.categoryService.getNomineeFromWinner(winner).pipe(
      map(nominee => nominee.nominee)
    );
  }

  getWinnerSubtitle(winner: Winner, category: Category): Observable<string> {
    return this.categoryService.getNomineeFromWinner(winner).pipe(
      map(nominee => this.getSubtitleText(nominee, category))
    );
  }

  getSubtitleText(nominee: Nominee, category: Category): string {
    return CategoryService.getSubtitleText(category, nominee);
  }

  mostRecentWinDate(category: Category): Date {
    return this.categoryService.mostRecentWinDate(category);
  }

  getVotedClass(category: Category): Observable<string> {
    return this.votesService.getMyVoteForCurrentYearAndCategory(category).pipe(
      map(vote => {
        if (this.votingMode() && !!vote) {
          return 'votedOn';
        } else {
          const winnersForCurrentYear = category.winners;
          if (this.winnersMode() && winnersForCurrentYear && winnersForCurrentYear.length > 0) {
            return 'winner';
          }
        }
        return '';
      })
    );
  }

  showCategories(): Observable<boolean> {
    return this.systemVarsService.canVote().pipe(
      map(canVote => (canVote || !this.votingMode()))
    );
  }

  showCategoriesWithNoWinners$(): Observable<boolean> {
    return combineLatest([this.getCategoriesWithNoWinner$(), this.showCategories()]).pipe(
      map(([categories, showCategories]) => categories.length > 0 && showCategories)
    );
  }

  showCategoriesWithWinners$(): Observable<boolean> {
    return combineLatest([this.getCategoriesWithAtLeastOneWinner$(), this.showCategories()]).pipe(
      map(([categories, showCategories]) => categories.length > 0 && showCategories)
    );
  }

  getCategoryName(category: Category): string {
    return this.categoryService.getCategoryName(category);
  }

  getCategorySubtitle(category: Category): string {
    return this.categoryService.getCategorySubtitle(category);
  }

  showVotingClosedMessage(): Observable<boolean> {
    return this.systemVarsService.canVote().pipe(
      map(canVote => this.votingMode() && canVote === false)
    );
  }

  votingMode(): boolean {
    return ActiveContext.Vote === this.activeContext;
  }

  oddsMode(): boolean {
    return ActiveContext.OddsAssignment === this.activeContext;
  }

  winnersMode(): boolean {
    return ActiveContext.Winner === this.activeContext;
  }

  showPersonPick(category: Category): Observable<boolean> {
    return this.didPickWinner(this.person, category).pipe(
      map(didPickWinner => !!this.person && !didPickWinner)
    );
  }

  showMyPick(category: Category): Observable<boolean> {
    return this.didPickWinner(this.me, category).pipe(
      map(didPickWinner => this.personIsMe() && !didPickWinner)
    );
  }

  wePickedTheSame(category: Category): Observable<boolean> {
    return this.pickedTheSame(this.me, this.person, category);
  }

  personPickClass(person: Person, category: Category): Observable<string> {
    return combineLatest([
      this.pickedTheSame(this.me, this.person, category),
      this.didPickWinner(person, category)
    ]).pipe(
      map(([pickedTheSame, didPickWinner]) => {
        if (!this.hasAtLeastOneWinner(category)) {
          if (this.me.id === person.id && !pickedTheSame) {
            return 'myDifferentPick';
          } else {
            return 'neutralPick';
          }
        } else {
          if (didPickWinner) {
            return 'correctPick';
          } else {
            return 'incorrectPick';
          }
        }
      })
    );
  }

  personPickHeaderClass(person: Person, category: Category): Observable<string> {
    return combineLatest([
      this.pickedTheSame(this.me, this.person, category),
      this.didPickWinner(person, category)
    ]).pipe(
      map(([pickedTheSame, didPickWinner]) => {
        if (!this.hasAtLeastOneWinner(category)) {
          if (this.me.id === person.id && !pickedTheSame) {
            return 'myDifferentPickHeader';
          } else {
            return 'neutralPickHeader';
          }
        } else {
          if (didPickWinner) {
            return 'correctPickHeader';
          } else {
            return 'incorrectPickHeader';
          }
        }
      })
    );
  }

  personIsMe(): boolean {
    return !!this.me && !!this.person && this.me.id === this.person.id;
  }

  personPossessiveDisplayName(): string {
    return this.personIsMe() ? 'Your' : this.person.first_name + '\'s';
  }

  myDisplayName(): string {
    return this.me.first_name;
  }

  personDisplayName(): string {
    return this.person.first_name;
  }

  bothPersonsDisplayName(): string {
    return this.person.first_name + ' & ' + this.me.first_name;
  }

  myPickName(category: Category): Observable<string> {
    return this.pickName(this.me, category);
  }

  personPickName(category: Category): Observable<string> {
    return this.pickName(this.person, category);
  }

  pickName(person: Person, category: Category): Observable<string> {
    return this.getPick(person, category).pipe(
      map(pick => !!pick ? pick.nominee : '(no pick made)')
    );
  }

  getMyWinnerScoreClass(category: Category): Observable<string> {
    return this.gotPointsForWinner(category).pipe(
      map(gotPoints => gotPoints ? 'winningScore' : 'losingScore')
    );
  }

  gotPointsForWinner(category: Category): Observable<boolean> {
    return this.votesService.didPersonVoteCorrectlyFor(this.person, category);
  }

  private pickedTheSame(person1: Person, person2: Person, category: Category): Observable<boolean> {
    const person1pick = this.getPick(person1, category);
    const person2pick = this.getPick(person2, category);
    return combineLatest([person1pick, person2pick]).pipe(
      map(([p1, p2]) => !!p1 && !!p2 && p1.id === p2.id)
    );
  }

  private didPickWinner(person: Person, category: Category): Observable<boolean> {
    return this.getPick(person, category).pipe(
      map(personPick => {
        const winning_ids = _.map(category.winners, winner => winner.nomination_id);
        if (this.votingMode()) {
          return !personPick;
        } else {
          return !!personPick && _.contains(winning_ids, personPick.id);
        }
      })
    );
  }

  // noinspection JSMethodCanBeStatic
  private hasAtLeastOneWinner(category: Category): boolean {
    return category.winners.length > 0;
  }

  private getPick(person: Person, category: Category): Observable<Nominee> {
    return this.votesService.getVoteForCurrentYearAndPersonAndCategory(person, category).pipe(
      map(myVote => {
        if (!!myVote) {
          return _.findWhere(category.nominees, {id: myVote.nomination_id});
        } else {
          return undefined;
        }
      })
    );
  }

}
