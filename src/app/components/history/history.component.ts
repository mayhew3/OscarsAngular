import {Component, OnInit} from '@angular/core';
import {FinalResult} from '../../interfaces/FinalResult';
import {FinalResultsService} from '../../services/final-results.service';
import * as _ from 'underscore';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import {MyAuthService} from '../../services/auth/my-auth.service';
import * as moment from 'moment';

@Component({
  selector: 'osc-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  public finalResults: FinalResult[];

  constructor(private finalResultsService: FinalResultsService,
              private personService: PersonService,
              private auth: MyAuthService) { }

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

  getScoreCardClass(champions: FinalResult[]): string {
    return this.iAmOneOfThe(champions) ? 'myScoreCard myMainScoreCard' : 'otherScoreCard';
  }

  getScoreScoreClass(champions: FinalResult[]): string {
    return this.iAmOneOfThe(champions) ? 'myScorePoints' : 'otherScorePoints';
  }

  iAmOneOfThe(champions: FinalResult[]): boolean {
    const person_ids = _.map(champions, champion => champion.person_id);
    const myPersonID = this.auth.getPersonID();
    return _.contains(person_ids, myPersonID);
  }

  showMyRank(champions: FinalResult[]): boolean {
    return !!this.getFinalResultForMe(champions) && !this.iAmOneOfThe(champions);
  }

  getChampionsString(champions: FinalResult[]): string {
    const names = _.map(champions, champion => this.getPerson(champion.person_id).first_name);
    return names.join(', ');
  }

  getFinalResultForMe(champions: FinalResult[]): FinalResult {
    const year = this.getYearFromChampionList(champions);
    const person_id = this.auth.getPersonID();
    return _.findWhere(this.finalResults, {year: year, person_id: person_id});
  }

  getMyFirstName(): string {
    return this.auth.getFirstName();
  }

  getMyRank(champions: FinalResult[]): string {
    const rank = this.getFinalResultForMe(champions).rank;
    return moment.localeData().ordinal(rank);
  }

  getMyScore(champions: FinalResult[]): number {
    const score = this.getFinalResultForMe(champions).score;
    return score;
  }
}
