import {Component, Input, OnInit} from '@angular/core';
import {Category} from '../../interfaces/Category';
import {Nominee} from '../../interfaces/Nominee';
import * as _ from 'underscore';
import {combineLatest, forkJoin, Observable} from 'rxjs';
import {CategoryService} from '../../services/category.service';
import {ActiveContext} from '../categories.context';
import {VotesService} from '../../services/votes.service';
import {map, mergeMap} from 'rxjs/operators';
import {PersonService} from '../../services/person.service';

@Component({
  selector: 'osc-category-hopper',
  templateUrl: './category-hopper.component.html',
  styleUrls: ['./category-hopper.component.scss']
})
export class CategoryHopperComponent implements OnInit {

  @Input() next: Observable<Category>;
  @Input() prev: Observable<Category>;
  @Input() category: Observable<Category>;
  @Input() nominees: Observable<Nominee[]>;
  @Input() activeContext: ActiveContext;
  private readonly contextUrls: string[];
  categoryCount = this.categoryService.categories.pipe(
    map(categories => categories.length)
  );

  constructor(private categoryService: CategoryService,
              private votesService: VotesService,
              private personService: PersonService) {
    this.contextUrls = [];
    this.contextUrls[ActiveContext.Vote] = 'vote';
    this.contextUrls[ActiveContext.OddsAssignment] = 'odds';
    this.contextUrls[ActiveContext.Winner] = 'winners';
  }

  ngOnInit(): void {
    this.clearOriginals();
  }

  baseLink(): string {
    return this.contextUrls[this.activeContext];
  }

  votingMode(): boolean {
    return ActiveContext.Vote === this.activeContext;
  }

  numVotesComplete(): Observable<number> {
    return this.personService.me$.pipe(
      mergeMap(me => this.votesService.getVotesForCurrentYearAndPerson(me)),
      map(votes => votes.length)
    );
  }

  showOdds(): boolean {
    return ActiveContext.OddsAssignment === this.activeContext;
  }

  totalOdds(subtitle: string): number {
    const odds_nums = _.map(this.nominees, (nominee) => nominee[`odds_${subtitle}`]);
    return this.oddsCalc(odds_nums);
  }

  totalOddsVegas(): Observable<number> {
    return this.nominees.pipe(
      map(nominees => {
        const odds_nums = _.map(nominees, (nominee) => this.vegasCalc(nominee.odds_numerator, nominee.odds_denominator));
        return this.oddsCalc(odds_nums);
      })
    );
  }

  // noinspection JSMethodCanBeStatic
  private vegasCalc(numerator?: number, denominator?: number): number {
    if (!numerator || !denominator) {
      return 0;
    } else {
      return denominator / (numerator + denominator) * 100;
    }
  }

  // noinspection JSMethodCanBeStatic
  private oddsCalc(odds_nums: number[]): number {
    const compacted = _.compact(odds_nums);
    const total_num = _.reduce(compacted, (memo, later) => memo + later);
    return total_num ? total_num : 0;
  }

  private getChanges(): Observable<Nominee[]> {
    return this.category.pipe(
      map(category => {
        return _.filter(category.nominees, (nominee) =>
          nominee.original_odds_expert !== nominee.odds_expert ||
          nominee.original_odds_user !== nominee.odds_user ||
          nominee.original_odds_numerator !== nominee.odds_numerator ||
          nominee.original_odds_denominator !== nominee.odds_denominator
        );
      })
    );
  }

  hasChanges(): Observable<boolean> {
    return this.getChanges().pipe(
      map(filtered => filtered.length > 0)
    );
  }

  submitOdds(): void {
    const requests: Observable<any>[] = [];
    const changes = this.getChanges();
    const categoryService = this.categoryService;
    _.forEach(changes, nominee => {
      requests.push(categoryService.updateNominee(nominee));
    });
    forkJoin(requests).subscribe(() => {
      this.clearOriginals();
    });
  }

  private clearOriginals(): Observable<void> {
    return this.category.pipe(
      map(category => {
        _.forEach(category.nominees, (nominee) => {
          nominee.original_odds_expert = nominee.odds_expert;
          nominee.original_odds_user = nominee.odds_user;
          nominee.original_odds_numerator = nominee.odds_numerator;
          nominee.original_odds_denominator = nominee.odds_denominator;
        });
      })
    );
  }

}
