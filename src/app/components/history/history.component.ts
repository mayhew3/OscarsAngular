import { Component, OnInit } from '@angular/core';
import {FinalResult} from '../../interfaces/FinalResult';
import {FinalResultsService} from '../../services/final-results.service';
import {_} from 'underscore';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';

@Component({
  selector: 'osc-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  public finalResults: FinalResult[];

  constructor(private finalResultsService: FinalResultsService,
              private personService: PersonService) { }

  ngOnInit() {
    this.finalResultsService.getFinalResultsForGroup(1).subscribe(finalResults => {
      this.finalResults = finalResults;
    });
  }

  getChampions(): FinalResult[][] {
    // noinspection TypeScriptValidateJSTypes
    const years = _.uniq(_.map(this.finalResults, finalResult => finalResult.year));
    years.sort((year1, year2) => {
      return year2 - year1;
    });

    const champions = [];
    _.each(years, year => {
      // noinspection TypeScriptValidateJSTypes
      const yearChamps = _.filter(this.finalResults, finalResult => finalResult.year === year && finalResult.rank === 1);
      champions.push(yearChamps);
    });

    return champions;
  }

  getYearFromChampionList(champions: FinalResult[]): number {
    return champions[0].year;
  }

  stillLoading(): boolean {
    return this.finalResultsService.stillLoading() || this.personService.stillLoading();
  }

  getPerson(person_id: number): Person {
    return this.personService.getPersonFromCache(person_id);
  }

  getChampionsString(champions: FinalResult[]): string {
    const names = _.map(champions, champion => this.getPerson(champion.person_id).first_name);
    return names.join(', ');
  }
}
