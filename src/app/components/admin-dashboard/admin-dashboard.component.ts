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

  yearForm;

  possibleYears: number[] = [];

  constructor(private systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private votesService: VotesService) { }

  ngOnInit() {
    this.systemVarsService.getSystemVars().subscribe(systemVars => {
      this.categoryService.getMaxYear().subscribe(maxYear => {
        this.possibleYears.push(systemVars.curr_year);
        this.possibleYears.push(maxYear);
      });
    });
  }

  changeCurrentYear(yearData): void {
    this.reloadingData = true;
    this.systemVarsService.changeCurrentYear(yearData.year).subscribe(() => {
      this.categoryService.refreshCache().subscribe(() => {
        this.votesService.refreshCache(yearData.year).subscribe(() => {
          this.reloadingData = false;
          this.yearForm.reset();
        });
      });
    });
  }
}
