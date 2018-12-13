import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {NomineesService} from '../../services/nominees.service';
import {ActivatedRoute} from '@angular/router';
import {Category} from '../../interfaces/Category';
import { Location } from '@angular/common';

@Component({
  selector: 'app-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  public category: Category;
  public nominees: Nominee[];

  constructor(private nomineesService: NomineesService,
              private route: ActivatedRoute,
              private location: Location) { }

  ngOnInit() {
    this.getNominees();
  }

  getNominees() {
    const category_id = +this.route.snapshot.paramMap.get('category_id');
    this.nomineesService.getNominees(category_id)
      .subscribe(nominees => this.nominees = nominees);
    this.nomineesService.getCategory(category_id)
      .subscribe(category => this.category = category);
  }

  goBack(): void {
    this.location.back();
  }
}
