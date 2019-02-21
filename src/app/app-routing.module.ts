import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CallbackComponent} from './components/callback/callback.component';
import {HomeComponent} from './components/home/home.component';
import {VoteMainComponent} from './components/vote-main/vote-main.component';
import {OddsMainComponent} from './components/odds-main/odds-main.component';
import {OddsDetailComponent} from './components/odds-detail/odds-detail.component';
import {VoteDetailComponent} from './components/vote-detail/vote-detail.component';
import {WinnerMainComponent} from './components/winner-main/winner-main.component';
import {WinnerDetailComponent} from './components/winner-detail/winner-detail.component';
import {ScoreboardComponent} from './components/scoreboard/scoreboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'callback', component: CallbackComponent },
  { path: 'vote', component: VoteMainComponent },
  { path: 'vote/:category_id', component: VoteDetailComponent },
  { path: 'odds', component: OddsMainComponent },
  { path: 'odds/:category_id', component: OddsDetailComponent },
  { path: 'winners', component: WinnerMainComponent },
  { path: 'winners/:category_id', component: WinnerDetailComponent },
  { path: 'scores', component: ScoreboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
