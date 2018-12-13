import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {InMemoryDataService} from './services/in-memory-data-service';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {HttpClientModule} from '@angular/common/http';
import {NomineesService} from './services/nominees.service';
import { CategoriesComponent } from './components/categories/categories.component';
import { NomineesComponent } from './components/nominees/nominees.component';

@NgModule({
  declarations: [
    AppComponent,
    CategoriesComponent,
    NomineesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,

// The HttpClientInMemoryWebApiModule module intercepts HTTP requests
// and returns simulated server responses.
// Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false, delay: 0 }
    )
  ],
  providers: [
    NomineesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
