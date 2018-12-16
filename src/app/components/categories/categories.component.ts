import { Component, OnInit } from '@angular/core';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';

@Component({
  selector: 'osc-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[];

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    this.getCategories();
  }

  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(categories => this.categories = categories);
  }

}
