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

@Component({
  selector: 'osc-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[];
  @Input() activeContext: ActiveContext;

  constructor(private categoryService: CategoryService,
              public systemVarsService: SystemVarsService) { }

  ngOnInit() {
    this.categoryService.getCategories()
      .subscribe(categories => {
        this.categories = categories;
        this.fastSortCategories();
      });
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

}
