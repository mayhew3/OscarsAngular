import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {ActiveContext} from '../categories.context';
import {SystemVarsService} from '../../services/system.vars.service';
import fast_sort from 'fast-sort';
import * as _ from 'underscore';
import * as moment from 'moment';
import {Winner} from '../../interfaces/Winner';
import {Nominee} from '../../interfaces/Nominee';
import {VotesService} from '../../services/votes.service';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {Person} from '../../interfaces/Person';

@Component({
  selector: 'osc-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[];
  me: Person;
  @Input() activeContext: ActiveContext;
  @Input() person: Person;

  showWinnerless = true;
  showWinners = true;

  constructor(private categoryService: CategoryService,
              public systemVarsService: SystemVarsService,
              private votesService: VotesService,
              private auth: MyAuthService) { }

  ngOnInit() {
    this.auth.me$.subscribe(me => {
      this.me = me;
      this.categoryService.getCategories()
        .subscribe(categories => {
          this.categories = categories;
          this.fastSortCategories();
          this.categoryService.subscribeToWinnerEvents().subscribe(() => {
            this.fastSortCategories();
          });
        });
    });
  }

  getRouterLink(category: Category): any[] {
    if (this.personIsMe() || !this.winnersMode()) {
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
    this.showWinnerless = !this.showWinnerless;
  }

  toggleShowWinners(): void {
    this.showWinners = !this.showWinners;
  }

  hideShowLink(showVar: boolean): string {
    return !!showVar ? '(hide)' : '(show)';
  }

  getCategoriesWithNoWinner(): Category[] {
    return _.filter(this.categories, category => category.winners.length === 0);
  }

  getCategoriesWithAtLeastOneWinner(): Category[] {
    return _.filter(this.categories, category => category.winners.length > 0);
  }

  getTimeAgo(category: Category): string {
    const winDate = this.mostRecentWinDate(category);
    if (!!winDate) {
      return moment(winDate).fromNow();
    } else {
      return undefined;
    }
  }

  getWinnerName(winner: Winner): string {
    return this.categoryService.getNomineeFromWinner(winner).nominee;
  }

  getWinnerSubtitle(winner: Winner, category: Category): string {
    const nominee = this.categoryService.getNomineeFromWinner(winner);
    return this.getSubtitleText(nominee, category);
  }

  getSubtitleText(nominee: Nominee, category: Category): string {
    return Nominee.getSubtitleText(category, nominee);
  }

  mostRecentWinDate(category: Category): Date {
    return category.winners.length > 0 ?
      _.max(_.map(category.winners, winner => winner.declared)) :
      undefined;
  }

  fastSortCategories(): void {
    fast_sort(this.categories)
      .by([
        {desc: category => this.mostRecentWinDate(category)},
        {asc: category => category.points},
        {asc: category => category.name}
      ]);
  }

  getVotedClass(category: Category): string {
    if (this.votingMode() && category.voted_on) {
      return 'votedOn';
    } else {
      const winnersForCurrentYear = category.winners;
      if (this.winnersMode() && winnersForCurrentYear && winnersForCurrentYear.length > 0) {
        return 'winner';
      }
    }
    return '';
  }

  showCategories(): boolean {
    return !this.stillLoading() &&
      (this.systemVarsService.canVote() || !this.votingMode());
  }

  showCategoriesWithNoWinners(): boolean {
    return this.showCategories() && this.getCategoriesWithNoWinner().length > 0;
  }

  showCategoriesWithWinners(): boolean {
    return this.showCategories() && this.getCategoriesWithAtLeastOneWinner().length > 0 && this.winnersMode();
  }

  getCategoryName(category: Category): string {
    return this.categoryService.getCategoryName(category);
  }

  getCategorySubtitle(category: Category): string {
    return this.categoryService.getCategorySubtitle(category);
  }

  showVotingClosedMessage(): boolean {
    return !this.stillLoading() &&
      this.votingMode() && !this.systemVarsService.canVote();
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

  stillLoading(): boolean {
    return this.systemVarsService.stillLoading() || this.categoryService.stillLoading();
  }

  showPersonPick(category: Category): boolean {
    return !!this.person && this.didPickWinner(this.person, category);
  }

  showMyPick(category: Category): boolean {
    return this.personIsMe() && !this.didPickWinner(this.me, category);
  }

  wePickedTheSame(category: Category): boolean {
    return this.pickedTheSame(this.me, this.person, category);
  }

  personPickClass(person: Person, category: Category): string {
    if (!this.hasAtLeastOneWinner(category)) {
      if (this.me.id === person.id && !this.pickedTheSame(this.me, this.person, category)) {
        return 'myDifferentPick';
      } else {
        return 'neutralPick';
      }
    } else {
      if (this.didPickWinner(person, category)) {
        return 'correctPick';
      } else {
        return 'incorrectPick';
      }
    }
  }

  personPickHeaderClass(person: Person, category: Category): string {
    if (!this.hasAtLeastOneWinner(category)) {
      if (this.me.id === person.id && !this.pickedTheSame(this.me, this.person, category)) {
        return 'myDifferentPickHeader';
      } else {
        return 'neutralPickHeader';
      }
    } else {
      if (this.didPickWinner(person, category)) {
        return 'correctPickHeader';
      } else {
        return 'incorrectPickHeader';
      }
    }
  }

  private pickedTheSame(person1: Person, person2: Person, category: Category): boolean {
    const person1pick = this.getPick(person1, category);
    const person2pick = this.getPick(person2, category);
    return !!person1pick && !!person2pick && person1pick.id === person2pick.id;
  }

  private didPickWinner(person: Person, category: Category): boolean {
    const personPick = this.getPick(person, category);
    const winning_ids = _.map(category.winners, winner => winner.nomination_id);
    if (this.votingMode()) {
      return !personPick;
    } else {
      return !!personPick && _.contains(winning_ids, personPick.id);
    }
  }

  private hasAtLeastOneWinner(category: Category): boolean {
    return category.winners.length > 0;
  }

  getPersonPick(category: Category): Nominee {
    return this.getPick(this.person, category);
  }

  getMyPick(category: Category): Nominee {
    return this.getPick(this.me, category);
  }

  private getPick(person: Person, category: Category): Nominee {
    const myVote = this.votesService.getVotesForCurrentYearAndPersonAndCategory(person, category);
    if (!!myVote) {
      return _.findWhere(category.nominees, {id: myVote.nomination_id});
    } else {
      return undefined;
    }
  }

  personIsMe(): boolean {
    return this.me.id === this.person.id;
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

  myPickName(category: Category): string {
    const myPick = this.getMyPick(category);
    return !!myPick ? myPick.nominee : '(no pick made)';
  }

  personPickName(category: Category): string {
    const yourPick = this.getPersonPick(category);
    return !!yourPick ? yourPick.nominee : '(no pick made)';
  }

  getMyWinnerScoreClass(category: Category): string {
    return this.gotPointsForWinner(category) ? 'winningScore' : 'losingScore';
  }

  gotPointsForWinner(category: Category): boolean {
    return this.categoryService.didPersonVoteCorrectlyFor(this.person, category);
  }

}
