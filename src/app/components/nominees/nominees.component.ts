import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {NomineesService} from '../../services/nominees.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  public nominees: Nominee[];

  constructor(private nomineesService: NomineesService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.getNominees();
  }

  getNominees() {
    const category_id = +this.route.snapshot.paramMap.get('category_id');
    this.nomineesService.getNominees(category_id)
      .subscribe(nominees => this.nominees = nominees);
  }
}
