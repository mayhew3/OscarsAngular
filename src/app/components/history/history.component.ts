import {Component, OnInit} from '@angular/core';
import {FinalResult} from '../../interfaces/FinalResult';
import {FinalResultsService} from '../../services/final-results.service';
import * as _ from 'underscore';
import {Person} from '../../interfaces/Person';
import {PersonService} from '../../services/person.service';
import * as moment from 'moment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'osc-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  public finalResults: FinalResult[];

  constructor(private finalResultsService: FinalResultsService,
              private personService: PersonService) { }

  ngOnInit(): void {
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

  getPerson(person_id: number): Observable<Person> {
    return this.personService.getPerson(person_id);
  }

  getScoreCardClass(champions: FinalResult[]): string {
    return this.iAmOneOfThe(champions) ? 'myScoreCard myMainScoreCard' : 'otherScoreCard';
  }

  getScoreScoreClass(champions: FinalResult[]): string {
    return this.iAmOneOfThe(champions) ? 'myScorePoints' : 'otherScorePoints';
  }

  iAmOneOfThe(champions: FinalResult[]): Observable<boolean> {
    const person_ids = _.map(champions, champion => champion.person_id);
    return this.personService.me$.pipe(
      map(me => _.contains(person_ids, me.id))
    );
  }

  showMyRank(champions: FinalResult[]): boolean {
    return !!this.getFinalResultForMe(champions) && !this.iAmOneOfThe(champions);
  }

  getChampionsString(champions: FinalResult[]): Observable<string> {
    return this.personService.persons.pipe(
      map(persons => {
        const names = _.map(champions, champion => _.findWhere(persons, {id: champion.person_id}).first_name);
        return names.join(', ');
      })
    );
  }

  getFinalResultForMe(champions: FinalResult[]): Observable<FinalResult> {
    return this.personService.me$.pipe(
      map(me => {
        const year = this.getYearFromChampionList(champions);
        return _.findWhere(this.finalResults, {year, person_id: me.id});
      })
    );
  }

  getMyFirstName(): Observable<string> {
    return this.personService.me$.pipe(
      map(me => me.first_name)
    );
  }

  getMyRank(champions: FinalResult[]): Observable<string> {
    return this.getFinalResultForMe(champions).pipe(
      map(finalResult => moment.localeData().ordinal(finalResult.rank))
    );
  }

  getMyScore(champions: FinalResult[]): Observable<number> {
    return this.getFinalResultForMe(champions).pipe(
      map(finalResult => finalResult.score)
    );
  }
}
