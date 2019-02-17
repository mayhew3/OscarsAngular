import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { NomineesComponent } from './components/nominees/nominees.component';
import { CategoryHopperComponent } from './components/category-hopper/category-hopper.component';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import {AuthService} from './services/auth/auth.service';
import {CallbackComponent} from './components/callback/callback.component';
import { HomeComponent } from './components/home/home.component';
import { OddsMainComponent } from './components/odds-main/odds-main.component';
import { VoteMainComponent } from './components/vote-main/vote-main.component';
import { VoteDetailComponent } from './components/vote-detail/vote-detail.component';
import { OddsDetailComponent } from './components/odds-detail/odds-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    CategoriesComponent,
    NomineesComponent,
    CategoryHopperComponent,
    CallbackComponent,
    HomeComponent,
    OddsMainComponent,
    VoteMainComponent,
    VoteDetailComponent,
    OddsDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    environment.httpModules // use in-memory for CLI environment, regular http for prod and local server
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
