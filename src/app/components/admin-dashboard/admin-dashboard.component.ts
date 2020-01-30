import { Component, OnInit } from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import {_} from 'underscore';

@Component({
  selector: 'osc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  reloadingData = false;

  currentYear: number;
  possibleYears: number[] = [];

  constructor(private systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private votesService: VotesService) { }

  ngOnInit() {
    this.systemVarsService.getSystemVars().subscribe(systemVars => {
      this.categoryService.getMaxYear().subscribe(maxYear => {
        this.currentYear = systemVars.curr_year;
        this.possibleYears.push(maxYear - 1);
        this.possibleYears.push(maxYear);
        if (!_.contains(this.possibleYears, this.currentYear)) {
          this.possibleYears.push(this.currentYear);
        }
      });
    });
  }

  yearButtonClass(year): string {
    if (this.currentYear === year) {
      return 'btn-success';
    } else {
      return 'btn-primary';
    }
  }

  changeCurrentYear(year): void {
    this.reloadingData = true;
    this.systemVarsService.changeCurrentYear(year).subscribe(() => {
      this.categoryService.refreshCache().subscribe(() => {
        this.votesService.refreshCache(year).subscribe(() => {
          this.reloadingData = false;
          this.currentYear = year;
        });
      });
    });
  }
}
