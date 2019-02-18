import {Component, Input, OnInit} from '@angular/core';
import {Nominee} from '../../interfaces/Nominee';
import {ActivatedRoute, Params} from '@angular/router';
import {Category} from '../../interfaces/Category';
import {CategoryService} from '../../services/category.service';
import {_} from 'underscore';
import {ActiveContext} from '../categories.context';
import {VotesService} from '../../services/votes.service';
import {AuthService} from '../../services/auth/auth.service';

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
  @Input() activeContext: ActiveContext;

  constructor(private categoryService: CategoryService,
              private votesService: VotesService,
              private route: ActivatedRoute,
              private auth: AuthService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const category_id = +params['category_id'];
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
      this.votesService.getVoteForCategory(category_id, 2017, this.auth.getPerson().id).subscribe(vote => {
        if (vote) {
          this.votedNominee = this.getNomineeWithID(vote.nominee_id);
        }
      });
    });
  }

  getNomineeWithID(nominee_id: number): Nominee {
    return _.findWhere(this.nominees, {id: nominee_id});
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
