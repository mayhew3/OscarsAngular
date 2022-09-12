import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {ActivatedRoute} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import * as _ from 'underscore';
import {ActiveContext} from '../categories.context';
import {VotesService} from '../../services/votes.service';
import {Person} from '../../interfaces/Person';
import {WinnersService} from '../../services/winners.service';
import {PersonService} from '../../services/person.service';
import {SystemVarsService} from '../../services/system.vars.service';
import {map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, firstValueFrom, Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SocketService} from '../../services/socket.service';
import {groupNumber} from '../../../shared/GlobalVars';
import {OddsInterface} from '../../../shared/OddsInterface';
import {CeremonyService} from '../../services/ceremony.service';
import fast_sort from 'fast-sort';
import {ArrayUtil} from '../../utility/ArrayUtil';

@Component({
  selector: 'osc-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  @Input() activeContext: ActiveContext;

  nomineeGroups = new Map<number, NomineeControls>();

  category$: Observable<Category> = this.route.params.pipe(
    mergeMap(params => {
      const category_id = +params.category_id;
      return this.categoryService.getCategory(category_id);
    })
  );

  nextCategory$: Observable<Category> = this.route.params.pipe(
    mergeMap(params => {
      const category_id = +params.category_id;
      return this.categoryService.getNextCategory(category_id);
    })
  );

  prevCategory$: Observable<Category> = this.route.params.pipe(
    mergeMap(params => {
      const category_id = +params.category_id;
      return this.categoryService.getPreviousCategory(category_id);
    })
  );

  winningNominees$: Observable<Nominee[]> = this.category$.pipe(
    map(category => _.map(category.winners, winner =>
      _.findWhere(category.nominees, {id: winner.nomination_id})))
  );

  private processingPick$ = new BehaviorSubject<Nominee>(undefined);

  constructor(private categoryService: CategoryService,
              private votesService: VotesService,
              private route: ActivatedRoute,
              private winnersService: WinnersService,
              private personService: PersonService,
              private ceremonyService: CeremonyService,
              private socket: SocketService) { }

  get nomineeGroupList(): NomineeControls[] {
    return Array.from(this.nomineeGroups.values());
  }

  ngOnInit(): void {
    this.initGroups();
  }

  initGroups(): void {
    this.category$.subscribe(category => {
      _.each(category.nominees, n => this.nomineeGroups.set(n.id, new NomineeControls(n)));
    });
  }

  personsForNominee(nominee: Nominee, category: Category): Observable<Person[]> {
    const votes$ = this.votesService.getVotesForCurrentYearAndCategory(category);
    const persons$ = this.personService.getPersonsForGroup(groupNumber);
    return combineLatest([votes$, persons$]).pipe(
      map(([votes, persons]) => {
        const votesForNominee = _.where(votes, {nomination_id: nominee.id});
        return _.map(votesForNominee, vote => _.findWhere(persons, {id: vote.person_id}));
      })
    );
  }

  getPersonDisplayName(person: Person): Observable<string> {
    return this.personService.getPersonName(person);
  }

  isMe(person: Person): Observable<boolean> {
    return this.personService.isMe(person);
  }

  getVoterClass(person: Person): Observable<string> {
    return this.isMe(person).pipe(
      map(isMe => !!isMe ? 'itsMe' : 'itsNotMe')
    );
  }

  async submitVote(nominee: Nominee): Promise<void> {
    const me = await firstValueFrom(this.personService.me$);
    if (this.votingMode()) {
      this.processingPick$.next(nominee);
      this.votesService.addOrUpdateVote(nominee, me);

      const voteCallback: () => void = () => {
        this.processingPick$.next(undefined);
        this.socket.off('add_vote', voteCallback);
        this.socket.off('change_vote', voteCallback);
      };

      this.socket.on('add_vote', voteCallback);
      this.socket.on('change_vote', voteCallback);
    }
  }

  async submitWinner(nominee: Nominee, category: Category): Promise<void> {
    await firstValueFrom(this.personService.me$);
    if (this.winnersMode() && this.personService.isAdmin) {
      this.processingPick$.next(nominee);
      this.winnersService.addOrDeleteWinner(nominee, category);

      const winnerCallback: () => void = () => {
        this.processingPick$.next(undefined);
        this.socket.off('add_winner', winnerCallback);
        this.socket.off('remove_winner', winnerCallback);
      };
      this.socket.on('add_winner', winnerCallback);
      this.socket.on('remove_winner', winnerCallback);
    }
  }

  getHeaderText(category: Category): string {
    return category ? this.categoryService.getCategoryName(category) : '';
  }

  getHeaderSubtitle(category: Category): string {
    return category ? this.categoryService.getCategorySubtitle(category) : '';
  }

  getHeaderPts(category: Category): string {
    return category ? category.points.toString() : '';
  }

  getNomineesSorted(category: Category): Nominee[] {
    const sorted = ArrayUtil.cloneArray(category.nominees);
    if (this.votingMode() && this.displayOddsPercentage()) {
      fast_sort(sorted)
        .by([
          {desc: n => this.vegasOddsAsPercentage(n)}
        ]);
    } else {
      fast_sort(sorted)
        .by([
          {asc: n => n.nominee},
          {asc: n => n.detail}
        ]);
    }
    return sorted;
  }

  showNominees(): Observable<boolean> {
    return this.ceremonyService.canVote().pipe(
      map(canVote => canVote || !this.votingMode())
    );
  }

  showVotingClosedMessage(): Observable<boolean> {
    return this.ceremonyService.canVote().pipe(
      map(canVote => this.votingMode() && canVote === false)
    );
  }

  getMainLineText(nominee: Nominee, category: Category): string {
    if (CategoryService.isSongCategory(category.name)) {
      return `"${nominee.nominee}"`;
    } else if (CategoryService.isTitleCategory(category.name) && !!nominee.context) {
      return `${nominee.nominee} (${nominee.context})`;
    } else {
      return nominee.nominee;
    }
  }

  updateVegasOdds(nominee: Nominee): void {
    const nomineeControls = this.nomineeGroups.get(nominee.id);
    const moneyline = nomineeControls.moneyline.value;
    if (!!moneyline) {
      const oddsInterface = OddsInterface.fromMoneylineFormatted(moneyline);
      const {numerator, denominator} = oddsInterface.asRatio();
      nomineeControls.numerator.setValue(numerator);
      nomineeControls.denominator.setValue(denominator);
    }
  }

  getSubtitleText(nominee: Nominee, category: Category): Observable<string> {
    return this.categoryService.getSubtitleText(category, nominee);
  }

  getSongSubtitles(nominee: Nominee): string[] {
    return nominee.detail.split('; ');
  }

  isVoted(nominee: Nominee): Observable<boolean> {
    return this.category$.pipe(
      mergeMap(category => this.votesService.getMyVoteForCurrentYearAndCategory(category)),
      map(vote => !!vote && vote.nomination_id === nominee.id)
    );
  }

  isWinner(nominee: Nominee): Observable<boolean> {
    return this.winningNominees$.pipe(
      map(winningNominees => !!winningNominees && winningNominees.includes(nominee))
    );
  }

  showSubtitleText(nominee: Nominee): boolean {
    return (!!nominee.context && nominee.nominee !== nominee.context) || !!nominee.detail;
  }

  showSongSubtitle(nominee: Nominee, category: Category): boolean {
    return (!!nominee.context || !!nominee.detail) && CategoryService.isSongCategory(category.name);
  }

  getVotedClass(nominee: Nominee): Observable<string> {
    return combineLatest([this.isVoted(nominee), this.isWinner(nominee), this.processingPick$.asObservable()]).pipe(
      map(([isVoted, isWinner, processingPick]) => {
        const classes = [];

        if (!!processingPick && processingPick.id === nominee.id) {
          classes.push('processing');
        } else if (this.votingMode() && isVoted) {
          classes.push('votedOn');
        } else if (this.winnersMode() && isWinner) {
          classes.push('winner');
        }

        if (this.personService.isAdmin || this.votingMode()) {
          classes.push('fakeLink');
        }

        return classes.join(' ');
      })
    );
  }

  vegasOddsDisplay(nominee: Nominee): string | undefined {
    if (!!nominee.odds_moneyline) {
      const percentage = this.moneylineAsPercentage(nominee.odds_moneyline);
      return Math.round(percentage * 100).toString() + '%';
    } else if (!!nominee.odds_numerator) {
      return nominee.odds_numerator + ':' + nominee.odds_denominator;
    } else {
      return undefined;
    }
  }

  displayOddsPercentage(): Observable<boolean> {
    return this.category$.pipe(
      map(category => {
        const nomineesWithRealPercentages = _.filter(category.nominees, n => !!n.odds_user || !!n.odds_expert);
        return nomineesWithRealPercentages.length === 0;
      })
    );
  }

  vegasOddsAsPercentage(nominee: Nominee): number {
    return OddsInterface.fromRatio(nominee.odds_numerator, nominee.odds_denominator).asPercentage() * 100;
  }

  moneylineAsPercentage(moneyline: number): number {
    return OddsInterface.fromMoneyline(moneyline).asPercentage();
  }

  votingMode(): boolean {
    return ActiveContext.Vote === this.activeContext;
  }

  winnersMode(): boolean {
    return ActiveContext.Winner === this.activeContext;
  }

  oddsMode(): boolean {
    return ActiveContext.OddsAssignment === this.activeContext;
  }

}

export class NomineeControls {
  expert: FormControl;
  user: FormControl;
  numerator: FormControl;
  denominator: FormControl;
  moneyline: FormControl;

  constructor(public nominee: Nominee) {
    this.expert = new FormControl(nominee.odds_expert);
    this.user = new FormControl(nominee.odds_user);
    this.numerator = new FormControl(nominee.odds_numerator);
    this.denominator = new FormControl(nominee.odds_denominator);

    if (!!nominee.odds_moneyline) {
      const oddsInterface = OddsInterface.fromMoneyline(nominee.odds_moneyline);
      this.moneyline = new FormControl(oddsInterface.asMoneylineFormatted());
    } else if (!!nominee.odds_denominator) {
      const oddsInterface = OddsInterface.fromRatio(nominee.odds_numerator, nominee.odds_denominator);
      this.moneyline = new FormControl(oddsInterface.asMoneylineFormatted());
    } else {
      this.moneyline = new FormControl();
    }
  }
}
