import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { CategoriesComponent } from './components/categories/categories.component';
import { NomineesComponent } from './components/nominees/nominees.component';
import { CategoryHopperComponent } from './components/category-hopper/category-hopper.component';
import {FormsModule} from '@angular/forms';

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
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
