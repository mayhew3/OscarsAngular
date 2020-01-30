import { Component, OnInit } from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';

@Component({
  selector: 'osc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  reloadingData = false;

  constructor(private systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private votesService: VotesService) { }

  ngOnInit() {
  }

  changeCurrentYear(year: number): void {
    this.reloadingData = true;
    this.systemVarsService.changeCurrentYear(year).subscribe(() => {
      this.categoryService.refreshCache().subscribe(() => {
        this.votesService.refreshCache(year).subscribe(() => {
          this.reloadingData = false;
        });
      });
    });
  }
}
