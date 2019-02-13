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

@NgModule({
  declarations: [
    AppComponent,
    CategoriesComponent,
    NomineesComponent,
    CategoryHopperComponent
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
