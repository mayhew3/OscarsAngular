import {Injectable} from '@angular/core';
import {Nominee} from '../interfaces/Nominee';
import {Winner} from '../interfaces/Winner';
import {Category} from '../interfaces/Category';
import _ from 'underscore';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class WinnersService {
  winnersUrl = '/api/winners';

  constructor(private api: ApiService) { }

  async addOrDeleteWinner(nominee: Nominee, category: Category): Promise<void> {
    const existing = this.existingWinner(nominee, category);
    if (!existing) {
      const data = {
        category_id: category.id,
        year: nominee.year,
        nomination_id: nominee.id,
        declared: new Date(),
      };
      await this.api.executePostAfterFullyConnected<Winner>(this.winnersUrl, data);
    } else {
      await this.api.executeDeleteAfterFullyConnected<Winner>(this.winnersUrl, existing.id);
    }
  }

  async resetWinners(year: number): Promise<void> {
    await this.api.executePutAfterFullyConnected<Winner>(`/api/resetWinners/`, {year});
  }

  private existingWinner(nominee: Nominee, category: Category): Winner {
    return _.find(category.winners, w => w.nomination_id === nominee.id);
  }

}
