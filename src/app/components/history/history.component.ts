import {Component, OnInit} from '@angular/core';
import {FinalResult} from '../../interfaces/FinalResult';
import {FinalResultsService} from '../../services/final-results.service';
import * as _ from 'underscore';
import {PersonService} from '../../services/person.service';
import * as moment from 'moment';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {groupNumber} from '../../../shared/GlobalVars';
import {CeremonyService} from '../../services/ceremony.service';
import {SystemVarsService} from '../../services/system.vars.service';

@Component({
  selector: 'osc-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  finalResults$ = this.finalResultsService.getFinalResultsForGroup(groupNumber);

  constructor(private finalResultsService: FinalResultsService,
              private personService: PersonService,
              private systemVarsService: SystemVarsService,
              private ceremonyService: CeremonyService) { }

  ngOnInit(): void {
  }

  getChampions(): Observable<FinalResult[][]> {
    return combineLatest([
      this.finalResults$,
      this.systemVarsService.systemVarsCeremonyYearChanges$,
      this.ceremonyService.ceremonyYearsFlattened
    ]).pipe(
      map(([finalResults, systemVars, ceremonyYears]) => {
        // noinspection TypeScriptValidateJSTypes
        const activeCeremonyYear = _.findWhere(ceremonyYears, {id: systemVars.ceremony_year_id});
        const ceremony_id = activeCeremonyYear.ceremony_id;

        const resultsForActiveCeremony = _.where(finalResults, {ceremony_id});
        const years = _.uniq(_.map(resultsForActiveCeremony, finalResult => finalResult.year));
        years.sort((year1, year2) =>
          year2 - year1);

        const champions = [];
        _.each(years, year => {
          // noinspection TypeScriptValidateJSTypes
          const yearScores = _.where(finalResults, {year});
          const yearChamps = _.where(yearScores, {rank: 1});
          if (yearChamps.length > 0) {
            champions.push(yearChamps);
          }
        });

        return champions;
      })
    );
  }

  getYearFromChampionList(champions: FinalResult[]): number {
    return champions[0].year;
  }

  getScoreCardClass(champions: FinalResult[]): Observable<string> {
    return this.iAmOneOfThe(champions).pipe(
      map(meChamp => !!meChamp ? 'myScoreCard myMainScoreCard' : 'otherScoreCard')
    );
  }

  getScoreScoreClass(champions: FinalResult[]): Observable<string> {
    return this.iAmOneOfThe(champions).pipe(
      map(meChamp => !!meChamp ? 'myScorePoints' : 'otherScorePoints')
    );
  }

  iAmOneOfThe(champions: FinalResult[]): Observable<boolean> {
    const person_ids = _.map(champions, champion => champion.person_id);
    return this.personService.me$.pipe(
      map(me => _.contains(person_ids, me.id))
    );
  }

  showMyRank(champions: FinalResult[]): Observable<boolean> {
    return combineLatest([this.getFinalResultForMe(champions), this.iAmOneOfThe(champions)]).pipe(
      map(([finalResult, meChamp]) => !!finalResult && !meChamp)
    );
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
    return combineLatest([this.personService.me$, this.finalResults$]).pipe(
      map(([me, finalResults]) => {
        const year = this.getYearFromChampionList(champions);
        return _.findWhere(finalResults, {year, person_id: me.id});
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
