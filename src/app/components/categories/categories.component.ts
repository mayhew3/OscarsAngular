import { Component, OnInit } from '@angular/core';
import {Category} from '../../interfaces/Category';
import {NomineesService} from '../../services/nominees.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[];
  selectedCategory: Category;

  constructor(private nomineeService: NomineesService,
              private router: Router) { }

  ngOnInit() {
    this.getCategories();
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
  }

  goToDetail(category: Category) {
    this.router.navigate(['/', 'nominees', category.id])
      .then(() => {});
  }

  getCategories(): void {
    this.nomineeService.getCategories()
      .subscribe(categories => this.categories = categories);
  }

}
