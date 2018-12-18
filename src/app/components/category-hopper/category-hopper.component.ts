import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';
import {Nominee} from '../../interfaces/Nominee';
import {_} from 'underscore';

@Component({
  selector: 'osc-category-hopper',
  templateUrl: './category-hopper.component.html',
  styleUrls: ['./category-hopper.component.scss']
})
export class CategoryHopperComponent implements OnInit {

  @Input() next: Category;
  @Input() prev: Category;
  @Input() nominees: Nominee[];

  constructor() { }

  ngOnInit() {
  }

  totalOdds(): number {
    const odds_nums = _.map(this.nominees, (nominee) => nominee.odds_expert);
    const compacted = _.compact(odds_nums);
    const total_num = _.reduce(compacted, (memo, later) => memo + later);
    return total_num ? total_num : 0;
  }

  hasChanges() {
    const filtered = _.filter(this.nominees, (nominee) => nominee.original_odds !== nominee.odds_expert);
    return filtered.length > 0;
  }

}
