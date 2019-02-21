import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {ActiveContext} from '../categories.context';
import {SystemVarsService} from '../../services/system.vars.service';

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
    this.getCategories();
  }

  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(categories => this.categories = categories);
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
