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
import {HistoryComponent} from './components/history/history.component';
import {PersonDetailComponent} from './components/person-detail/person-detail.component';
import {AdminDashboardComponent} from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'callback',
    component: CallbackComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'vote',
    component: VoteMainComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'vote/:category_id',
    component: VoteDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'odds',
    component: OddsMainComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'odds/:category_id',
    component: OddsDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'winners',
    component: WinnerMainComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'winners/:category_id',
    component: WinnerDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'scores',
    component: ScoreboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'person/:person_id',
    component: PersonDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
