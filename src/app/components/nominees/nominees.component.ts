import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {ActivatedRoute} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import * as _ from 'underscore';
import {ActiveContext} from '../categories.context';
import {VotesService} from '../../services/votes.service';
import {Vote} from '../../interfaces/Vote';
import {Person} from '../../interfaces/Person';
import {WinnersService} from '../../services/winners.service';
import {PersonService} from '../../services/person.service';
import {SystemVarsService} from '../../services/system.vars.service';
import {map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';

@Component({
  selector: 'osc-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  private processingPick$ = new BehaviorSubject<Nominee>(undefined);
  @Input() activeContext: ActiveContext;

  // todo: allow multiple groups
  groupNumber = 1;

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

  votedNominee$: Observable<Nominee> = this.category$.pipe(
    map(category => _.findWhere(category.nominees, {id: category.voted_on}))
  );

  winningNominees$: Observable<Nominee[]> = this.category$.pipe(
    map(category => _.map(category.winners, winner =>
      _.findWhere(category.nominees, {id: winner.nomination_id})))
  );

  constructor(private categoryService: CategoryService,
              private votesService: VotesService,
              private route: ActivatedRoute,
              private winnersService: WinnersService,
              private personService: PersonService,
              private systemVarsService: SystemVarsService) { }

  ngOnInit(): void {
    if (this.winnersMode()) {
      this.categoryService.subscribeToWinnerEvents().subscribe(() => {
        this.processingPick$.next( undefined);
      });
    }
  }

  personsForNominee(nominee: Nominee, category: Category): Observable<Person[]> {
    const votes$ = this.votesService.getVotesForCurrentYearAndCategory(category);
    const persons$ = this.personService.getPersonsForGroup(this.groupNumber);
    return combineLatest([votes$, persons$]).pipe(
      map(([votes, persons]) => {
        const votesForNominee = _.where(votes, {nomination_id: nominee.id});
        return _.map(votesForNominee, vote => _.findWhere(persons, {id: vote.person_id}));
      })
    );
  }

  getVoterClass(person: Person): Observable<string> {
    return this.personService.isMe(person).pipe(
      map(isMe => !!isMe ? 'itsMe' : '')
    );
  }

  submitVoteOrWinner(nominee: Nominee, category: Category): void {
    this.personService.me$.subscribe(me => {
      if (this.votingMode()) {
        this.processingPick$.next(nominee);
        this.votesService.addOrUpdateVote(nominee, me).subscribe((vote: Vote) => {
          // todo: MA-40 - this sucks, better way to check for error response.
          if (vote && vote.id) {
            // this.votedNominee = nominee;
            category.voted_on = nominee.id;
          }
          this.processingPick$.next(undefined);
        });
      } else if (this.winnersMode() && this.personService.isAdmin) {
        this.processingPick$.next(nominee);
        this.winnersService.addOrDeleteWinner(nominee, category).subscribe(() => this.processingPick$.next(undefined));
      }
    });
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

  showNominees(): Observable<boolean> {
    return this.systemVarsService.canVote().pipe(
      map(canVote => !this.stillLoading() && (canVote || !this.votingMode()))
    );
  }

  showVotingClosedMessage(): boolean {
    return !this.stillLoading() &&
      this.votingMode() && !this.systemVarsService.canVote();
  }

  stillLoading(): boolean {
    return false;
  }

  getMainLineText(nominee: Nominee): string {
    return nominee.nominee;
  }

  getSubtitleText(nominee: Nominee, category: Category): string {
    return CategoryService.getSubtitleText(category, nominee);
  }

  getSongSubtitles(nominee: Nominee): string[] {
    return nominee.detail.split('; ');
  }

  isVoted(nominee: Nominee): Observable<boolean> {
    return this.votedNominee$.pipe(
      map(votedNominee => !!votedNominee && votedNominee.id === nominee.id)
    );
  }

  showSubtitleText(nominee: Nominee, category: Category): boolean {
    return !!nominee.context && !CategoryService.isSongCategory(category.name);
  }

  showSongSubtitle(nominee: Nominee, category: Category): boolean {
    return !!nominee.context && CategoryService.isSongCategory(category.name);
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

  isWinner(nominee: Nominee): Observable<boolean> {
    return this.winningNominees$.pipe(
      map(winningNominees => !!winningNominees && winningNominees.includes(nominee))
    );
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
