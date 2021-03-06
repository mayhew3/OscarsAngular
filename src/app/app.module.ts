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
import {WinnerMainComponent} from './components/winner-main/winner-main.component';
import {WinnerDetailComponent} from './components/winner-detail/winner-detail.component';
import {ScoreboardComponent} from './components/scoreboard/scoreboard.component';
import {HistoryComponent} from './components/history/history.component';
import {InMemoryCallbacksService} from './services/in-memory-callbacks.service';
import {PersonDetailComponent} from './components/person-detail/person-detail.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
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
import {OddsState} from './states/odds.state';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConnectionProblemComponent} from './components/connection-problem/connection-problem.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {ErrorNotificationComponent} from './components/error-notification/error-notification.component';
import {PersonConnectionSnackBarComponent} from './components/person-connection-snack-bar/person-connection-snack-bar.component';
import {FrontPageLogoComponent} from './components/front-page-logo/front-page-logo.component';
import {NavBarComponent} from './components/nav-bar/nav-bar.component';
import {DotComponent} from './components/dot/dot.component';
import {CountdownComponent} from './components/countdown/countdown.component';

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
    AdminDashboardComponent,
    ConnectionProblemComponent,
    ErrorNotificationComponent,
    PersonConnectionSnackBarComponent,
    FrontPageLogoComponent,
    NavBarComponent,
    DotComponent,
    CountdownComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    environment.httpModules,
    NgbModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    NgxsModule.forRoot([
      PersonState,
      SystemVarsState,
      CategoryState,
      MaxYearState,
      VoteState,
      FinalResultState,
      OddsState
    ], {
      developmentMode: !environment.production
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production
    }),
    // use in-memory for CLI environment, regular http for prod and local server
    AuthModule.forRoot({
      domain: 'mayhew3.auth0.com',
      clientId: environment.clientID,
      audience: 'https://oscars.v2.mayhew3.com/',
      redirectUri: `${window.location.origin}`,
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
      scope: 'offline_access',
      leeway: 80,

      // Specify configuration for the interceptor
      httpInterceptor: {
        allowedList: ['*'],
      },
    }),
    BrowserAnimationsModule,
  ],
  providers: [
    MyAuthService,
    environment.socketModule,
    environment.initSocketModule,
    environment.loggerModule,
    InMemoryCallbacksService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
