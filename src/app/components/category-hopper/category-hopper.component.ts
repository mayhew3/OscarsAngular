import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';

@Component({
  selector: 'app-category-hopper',
  templateUrl: './category-hopper.component.html',
  styleUrls: ['./category-hopper.component.scss']
})
export class CategoryHopperComponent implements OnInit {

  @Input() next: Category;
  @Input() prev: Category;

  constructor() { }

  ngOnInit() {
  }

}
