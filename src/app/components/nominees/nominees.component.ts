import {Component, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {NomineesService} from '../../services/nominees.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Category} from '../../interfaces/Category';
import { Location } from '@angular/common';
import {CategoryService} from '../../services/category.service';

@Component({
  selector: 'app-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  public category: Category;
  public nextCategory: Category;
  public nominees: Nominee[];

  constructor(private nomineesService: NomineesService,
              private categoryService: CategoryService,
              private route: ActivatedRoute,
              private location: Location,
              private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const category_id = +params['category_id'];
      this.nomineesService.getNominees(category_id)
        .subscribe(nominees => this.nominees = nominees);
      this.categoryService.getCategory(category_id)
        .subscribe(category => this.category = category);
      this.nextCategory = this.categoryService.getNextCategory(category_id);
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToNext(): void {
    this.router.navigate(['/', 'nominees', this.nextCategory.id])
      .then(() => {});
  }
}
