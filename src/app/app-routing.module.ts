import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CallbackComponent} from './components/callback/callback.component';
import {HomeComponent} from './components/home/home.component';
import {VoteMainComponent} from './components/vote-main/vote-main.component';
import {OddsMainComponent} from './components/odds-main/odds-main.component';
import {OddsDetailComponent} from './components/odds-detail/odds-detail.component';
import {VoteDetailComponent} from './components/vote-detail/vote-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'callback', component: CallbackComponent },
  { path: 'vote', component: VoteMainComponent },
  { path: 'odds', component: OddsMainComponent },
  { path: 'vote/:category_id', component: VoteDetailComponent },
  { path: 'odds/:category_id', component: OddsDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
