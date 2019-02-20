import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {ActivatedRoute, Params} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {_} from 'underscore';
import {ActiveContext} from '../categories.context';
import {VotesService} from '../../services/votes.service';
import {AuthService} from '../../services/auth/auth.service';
import {Vote} from '../../interfaces/Vote';
import {Person} from '../../interfaces/Person';

@Component({
  selector: 'osc-nominees',
  templateUrl: './nominees.component.html',
  styleUrls: ['./nominees.component.scss']
})
export class NomineesComponent implements OnInit {
  public category: Category;
  public nextCategory: Category;
  public previousCategory: Category;
  public nominees: Nominee[];
  public votedNominee: Nominee;
  private person: Person;
  @Input() activeContext: ActiveContext;

  constructor(private categoryService: CategoryService,
              private votesService: VotesService,
              private route: ActivatedRoute,
              private auth: AuthService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const category_id = +params['category_id'];
      this.auth.getPerson().subscribe(person => {
        this.person = person;
        this.categoryService.getNominees(category_id)
          .subscribe(nominees => {
            this.nominees = nominees;
          });
        this.categoryService.getCategory(category_id)
          .subscribe(category => this.category = category);
        this.categoryService.getNextCategory(category_id)
          .subscribe(category => this.nextCategory = category);
        this.categoryService.getPreviousCategory(category_id)
          .subscribe(category => this.previousCategory = category);

        if (this.voting()) {
          this.votedNominee = _.findWhere(this.nominees, {
            id: this.category.voted_on
          });
        }
      });
    });
  }

  submitVote(nominee: Nominee): void {
    this.votesService.addOrUpdateVote(nominee, this.person).subscribe((vote: Vote) => {
      // todo: MA-40 - this sucks, better way to check for error response.
      if (vote && vote.id) {
        this.votedNominee = nominee;
        this.category.voted_on = nominee.id;
      }
    });
  }

  getMainLineText(nominee: Nominee): string {
    return nominee.nominee;
  }

  getSubtitleText(nominee: Nominee): string {
    const singleLineCategories = ['Best Picture', 'Documentary Feature', 'Documentary Short', 'Short Film (Animated)', 'Short Film (Live Action)', 'Animated Feature'];

    if (singleLineCategories.includes(this.category.name)) {
      return undefined;
    } else if (nominee.nominee === nominee.context) {
      return nominee.detail;
    } else {
      return nominee.context;
    }
  }

  isVoted(nominee: Nominee): boolean {
    return this.votedNominee && this.votedNominee.id === nominee.id;
  }

  getVotedClass(nominee: Nominee): string {
    return this.isVoted(nominee) && this.voting() ? 'votedOn' : '';
  }

  voting(): boolean {
    return ActiveContext.Vote === this.activeContext;
  }

  showOdds(): boolean {
    return ActiveContext.OddsAssignment === this.activeContext;
  }

}
