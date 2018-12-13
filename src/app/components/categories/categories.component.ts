import { Component, OnInit } from '@angular/core';
import {Category} from '../../interfaces/Category';
import {NomineesService} from '../../services/nominees.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[];

  constructor(private nomineeService: NomineesService) { }

  ngOnInit() {
    this.getNominees();
  }

  getNominees(): void {
    this.nomineeService.getNominees()
      .subscribe(categories => this.categories = categories);
  }
}
