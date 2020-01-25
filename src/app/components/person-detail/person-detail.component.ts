import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PersonService} from '../../services/person.service';
import {Person} from '../../interfaces/Person';
import {CategoryService} from '../../services/category.service';
import {Category} from '../../interfaces/Category';
import {_} from 'underscore';
import fast_sort from 'fast-sort';
import {Winner} from '../../interfaces/Winner';

@Component({
  selector: 'osc-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss']
})
export class PersonDetailComponent implements OnInit {
  private person: Person;
  // noinspection JSMismatchedCollectionQueryUpdate
  private voteInfos: VoteInfo[] = [];

  constructor(private route: ActivatedRoute,
              private personService: PersonService,
              private categoryService: CategoryService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const person_id = +params['person_id'];
      this.personService.getPerson(person_id).subscribe(person => {
        this.person = person;
        this.updateVoteInfos();
        this.categoryService.subscribeToWinnerEvents().subscribe(() => {
          this.updateVoteInfos();
        });
      });
    });
  }

  updateVoteInfos(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.voteInfos = [];
      _.forEach(categories, category => {
        const isWinner = this.categoryService.didPersonVoteCorrectlyFor(this.person, category);
        const winners: Winner[] = category.winners;
        fast_sort(winners).desc([
          winner => winner.declared
        ]);
        const voteInfo: VoteInfo = {
          category: category,
          winnerDate: winners.length > 0 ? winners[0].declared : undefined,
          isWinner: isWinner
        };
        this.voteInfos.push(voteInfo);
      });

      fast_sort(this.voteInfos).by([
        {desc: voteInfo => voteInfo.winnerDate},
        {asc: voteInfo => voteInfo.category.points}
      ]);
    });
  }

  futureVoteInfos(): VoteInfo[] {
    // noinspection TypeScriptValidateJSTypes
    return _.filter(this.voteInfos, voteInfo => !voteInfo.winnerDate);
  }

  pastVoteInfos(): VoteInfo[] {
    // noinspection TypeScriptValidateJSTypes
    return _.filter(this.voteInfos, voteInfo => !!voteInfo.winnerDate);
  }

  winnerClass(voteInfo: VoteInfo): string {
    return voteInfo.isWinner ? 'winner' : 'loser';
  }

  stillLoading(): boolean {
    return this.personService.stillLoading() || this.categoryService.stillLoading();
  }
}

class VoteInfo {
  category: Category;
  winnerDate: Date;
  isWinner: boolean;
}
