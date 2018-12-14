import {Component, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {NomineesService} from '../../services/nominees.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';

@Component({
  selector: 'app-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  public category: Category;
  public nextCategory: Category;
  public previousCategory: Category;
  public nominees: Nominee[];

  constructor(private nomineesService: NomineesService,
              private categoryService: CategoryService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const category_id = +params['category_id'];
      this.categoryService.getNominees(category_id)
        .subscribe(nominees => this.nominees = nominees);
      this.categoryService.getCategory(category_id)
        .subscribe(category => this.category = category);
      this.nextCategory = this.categoryService.getNextCategory(category_id);
      this.previousCategory = this.categoryService.getPreviousCategory(category_id);
    });
  }

}
