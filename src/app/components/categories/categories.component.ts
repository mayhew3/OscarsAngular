import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {ActiveContext} from '../categories.context';
import {SystemVarsService} from '../../services/system.vars.service';
import fast_sort from 'fast-sort';
import {_} from 'underscore';
import * as moment from 'moment';
import {Winner} from '../../interfaces/Winner';
import {Nominee} from '../../interfaces/Nominee';
import {VotesService} from '../../services/votes.service';
import {AuthService} from '../../services/auth/auth.service';
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

  showWinnerless = true;
  showWinners = true;

  constructor(private categoryService: CategoryService,
              public systemVarsService: SystemVarsService,
              private votesService: VotesService,
              private auth: AuthService) { }

  ngOnInit() {
    this.auth.getPerson().subscribe(person => {
      this.me = person;
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

  toggleShowWinnerless(): void {
    this.showWinnerless = !this.showWinnerless;
  }

  toggleShowWinners(): void {
    this.showWinners = !this.showWinners;
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

  showYourPick(category: Category): boolean {
    const yourPick = this.getYourPick(category);
    const winning_ids = _.map(category.winners, winner => winner.nomination_id);
    if (this.votingMode()) {
      return !!yourPick;
    } else {
      return !yourPick || !_.contains(winning_ids, yourPick.id);
    }
  }

  getYourPick(category: Category): Nominee {
    const myVotes = this.votesService.getVotesForCurrentYearAndPersonAndCategory(this.me, category);
    if (myVotes.length > 0) {
      return _.findWhere(category.nominees, {id: myVotes[0].nomination_id});
    } else {
      return undefined;
    }
  }

  yourPickName(category: Category): string {
    const yourPick = this.getYourPick(category);
    return !!yourPick ? yourPick.nominee : '(no pick made)';
  }

  getMyWinnerScoreClass(category: Category): string {
    return this.gotPointsForWinner(category) ? 'winningScore' : 'losingScore';
  }

  gotPointsForWinner(category: Category): boolean {
    return this.categoryService.didPersonVoteCorrectlyFor(this.me, category);
  }

}
