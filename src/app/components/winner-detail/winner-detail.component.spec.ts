import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerDetailComponent } from './winner-detail.component';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {CategoriesComponent} from '../categories/categories.component';
import {NomineesComponent} from '../nominees/nominees.component';
import {CategoryHopperComponent} from '../category-hopper/category-hopper.component';
import {HomeComponent} from '../home/home.component';
import {VoteMainComponent} from '../vote-main/vote-main.component';
import {OddsMainComponent} from '../odds-main/odds-main.component';
import {VoteDetailComponent} from '../vote-detail/vote-detail.component';
import {OddsDetailComponent} from '../odds-detail/odds-detail.component';
import {WinnerMainComponent} from '../winner-main/winner-main.component';
import {CallbackComponent} from '../callback/callback.component';
import {ActivatedRoute} from '@angular/router';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {CategoryService} from '../../services/category.service';
import {CategoryServiceStub} from '../../services/category.service.stub';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {AuthServiceStub} from '../../services/auth/auth.service.stub';
import {ScoreboardComponent} from '../scoreboard/scoreboard.component';

describe('WinnerDetailComponent', () => {
  let component: WinnerDetailComponent;
  let fixture: ComponentFixture<WinnerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        FormsModule],
      declarations: [
        CategoriesComponent,
        NomineesComponent,
        CategoryHopperComponent,
        HomeComponent,
        VoteMainComponent,
        OddsMainComponent,
        VoteDetailComponent,
        OddsDetailComponent,
        WinnerMainComponent,
        WinnerDetailComponent,
        ScoreboardComponent,
        CallbackComponent],
      providers: [
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub({category_id: 2})},
        {provide: CategoryService, useClass: CategoryServiceStub},
        {provide: MyAuthService, useClass: AuthServiceStub}
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinnerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
