import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';
import {Nominee} from '../../interfaces/Nominee';
import {_} from 'underscore';
import {forkJoin, Observable} from 'rxjs';
import {CategoryService} from '../../services/category.service';

@Component({
  selector: 'osc-category-hopper',
  templateUrl: './category-hopper.component.html',
  styleUrls: ['./category-hopper.component.scss']
})
export class CategoryHopperComponent implements OnInit {

  @Input() next: Category;
  @Input() prev: Category;
  @Input() nominees: Nominee[];

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    this.clearOriginals();
  }

  totalOdds(subtitle: string): number {
    const odds_nums = _.map(this.nominees, (nominee) => nominee[`odds_${subtitle}`]);
    return this.oddsCalc(odds_nums);
  }

  totalOddsVegas(): number {
    const odds_nums = _.map(this.nominees, (nominee) => this.vegasCalc(nominee.odds_numerator, nominee.odds_denominator));
    return this.oddsCalc(odds_nums);
  }

  private vegasCalc(numerator?: number, denominator?: number): number {
    if (!numerator || !denominator) {
      return 0;
    } else {
      return denominator / (numerator + denominator) * 100;
    }
  }

  private oddsCalc(odds_nums: number[]): number {
    const compacted = _.compact(odds_nums);
    const total_num = _.reduce(compacted, (memo, later) => memo + later);
    return total_num ? total_num : 0;
  }

  getChanges() {
    return _.filter(this.nominees, (nominee) =>
      nominee.original_odds_expert !== nominee.odds_expert ||
      nominee.original_odds_user !== nominee.odds_user ||
      nominee.original_odds_numerator !== nominee.odds_numerator ||
      nominee.original_odds_denominator !== nominee.odds_denominator
    );
  }

  hasChanges() {
    const filtered = this.getChanges();
    return filtered.length > 0;
  }

  submitOdds() {
    const requests: Observable<any>[] = [];
    const changes = this.getChanges();
    const categoryService = this.categoryService;
    _.forEach(changes, function(nominee) {
      requests.push(categoryService.updateNominee(nominee));
    });
    forkJoin(requests).subscribe(() => {
      this.clearOriginals();
    });
  }

  clearOriginals() {
    _.forEach(this.nominees, (nominee) => {
      nominee.original_odds_expert = nominee.odds_expert;
      nominee.original_odds_user = nominee.odds_user;
      nominee.original_odds_numerator = nominee.odds_numerator;
      nominee.original_odds_denominator = nominee.odds_denominator;
    });
  }

}
