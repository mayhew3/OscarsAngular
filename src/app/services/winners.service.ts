import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Nominee} from '../interfaces/Nominee';
import {Winner} from '../interfaces/Winner';
import {Category} from '../interfaces/Category';
import _ from 'underscore';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class WinnersService {
  winnersUrl = 'api/winners';

  constructor(private http: HttpClient) { }

  private existingWinner(nominee: Nominee, category: Category): Winner {
    return _.find(category.winners, w => w.nomination_id === nominee.id);
  }

  addOrDeleteWinner(nominee: Nominee, category: Category): void {
    const existing = this.existingWinner(nominee, category);
    if (!existing) {
      const data = {
        category_id: category.id,
        year: nominee.year,
        nomination_id: nominee.id,
        declared: new Date(),
      };
      this.http.post<any>(this.winnersUrl, data, httpOptions).subscribe();
    } else {
      this.http.delete<Winner>(`/api/winners/${existing.id}`, httpOptions).subscribe();
    }
  }

  resetWinners(year: number): void {
    this.http.put<Winner>(`/api/resetWinners/`, {year}, httpOptions).subscribe();
  }

}
