import {Component, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {ActivatedRoute, Params} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {_} from 'underscore';

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

  constructor(private categoryService: CategoryService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const category_id = +params['category_id'];
      this.categoryService.getNominees(category_id)
        .subscribe(nominees => {
          this.nominees = nominees;
          _.forEach(this.nominees, (nominee) => {
            nominee.original_odds_expert = nominee.odds_expert;
            nominee.original_odds_user = nominee.odds_user;
            nominee.original_odds_numerator = nominee.odds_numerator;
            nominee.original_odds_denominator = nominee.odds_denominator;
          });
        });
      this.categoryService.getCategory(category_id)
        .subscribe(category => this.category = category);
      this.categoryService.getNextCategory(category_id)
        .subscribe(category => this.nextCategory = category);
      this.categoryService.getPreviousCategory(category_id)
        .subscribe(category => this.previousCategory = category);
    });
  }

}
