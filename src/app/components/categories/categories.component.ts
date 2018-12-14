import { Component, OnInit } from '@angular/core';
import {Category} from '../../interfaces/Category';
import {Router} from '@angular/router';
import {CategoryService} from '../../services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[];

  constructor(private categoryService: CategoryService,
              private router: Router) { }

  ngOnInit() {
    this.getCategories();
  }

  goToDetail(category: Category) {
    this.router.navigate(['/', 'nominees', category.id])
      .then(() => {});
  }

  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(categories => this.categories = categories);
  }

}
