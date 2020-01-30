import { Component, OnInit } from '@angular/core';
import {SystemVarsService} from '../../services/system.vars.service';
import {CategoryService} from '../../services/category.service';
import {VotesService} from '../../services/votes.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'osc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  reloadingData = false;

  yearForm;

  constructor(private systemVarsService: SystemVarsService,
              private categoryService: CategoryService,
              private votesService: VotesService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.systemVarsService.getSystemVars().subscribe(systemVars => {
      const year = systemVars.curr_year;
      this.yearForm = this.formBuilder.group({
        year: year
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
