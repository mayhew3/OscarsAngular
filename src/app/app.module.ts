import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CategoriesComponent} from './components/categories/categories.component';
import {NomineesComponent} from './components/nominees/nominees.component';
import {CategoryHopperComponent} from './components/category-hopper/category-hopper.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {environment} from '../environments/environment';
import {MyAuthService} from './services/auth/my-auth.service';
import {CallbackComponent} from './components/callback/callback.component';
import {HomeComponent} from './components/home/home.component';
import {OddsMainComponent} from './components/odds-main/odds-main.component';
import {VoteMainComponent} from './components/vote-main/vote-main.component';
import {VoteDetailComponent} from './components/vote-detail/vote-detail.component';
import {OddsDetailComponent} from './components/odds-detail/odds-detail.component';
import {SystemVarsService} from './services/system.vars.service';
import {WinnerMainComponent} from './components/winner-main/winner-main.component';
import {WinnerDetailComponent} from './components/winner-detail/winner-detail.component';
import {ScoreboardComponent} from './components/scoreboard/scoreboard.component';
import {HistoryComponent} from './components/history/history.component';
import {InMemoryCallbacksService} from './services/in-memory-callbacks.service';
import {PersonDetailComponent} from './components/person-detail/person-detail.component';
import {NgbDropdownModule, NgbProgressbarModule} from '@ng-bootstrap/ng-bootstrap';
import {AdminDashboardComponent} from './components/admin-dashboard/admin-dashboard.component';
import {AuthHttpInterceptor, AuthModule} from '@auth0/auth0-angular';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgxsModule} from '@ngxs/store';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import {NgxsLoggerPluginModule} from '@ngxs/logger-plugin';
import {PersonState} from './states/person.state';
import {SystemVarsState} from './states/systemVars.state';
import {CategoryState} from './states/category.state';
import {MaxYearState} from './states/maxYear.state';
import {VoteState} from './states/vote.state';
import {FinalResultState} from './states/final-result.state';

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
    OddsDetailComponent,
    WinnerMainComponent,
    WinnerDetailComponent,
    ScoreboardComponent,
    HistoryComponent,
    PersonDetailComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    environment.httpModules,
    NgbDropdownModule,
    NgbProgressbarModule,
    ReactiveFormsModule,
    NgxsModule.forRoot([
      PersonState,
      SystemVarsState,
      CategoryState,
      MaxYearState,
      VoteState,
      FinalResultState
    ]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
    // use in-memory for CLI environment, regular http for prod and local server
    AuthModule.forRoot({
      domain: 'mayhew3.auth0.com',
      clientId: environment.clientID,
      audience: 'https://oscars.v2.mayhew3.com/',
      redirectUri: AppModule.getCallbackUrl(),

      // Specify configuration for the interceptor
      httpInterceptor: {
        allowedList: ['*'],
      },
    }),
  ],
  providers: [
    MyAuthService,
    SystemVarsService,
    environment.socketModule,
    InMemoryCallbacksService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  static getCallbackUrl(): string {
    console.log('Environment doman: ' + environment.domain);
    const protocol = window.location.protocol;
    const path = window.location.hostname;
    const port = window.location.port;
    const portDisplay = port === '' ? '' : ':' + port;
    // noinspection UnnecessaryLocalVariableJS
    const fullPath = protocol + '//' + path + portDisplay + '/callback';
    return fullPath;
  }

}
