import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OddsDetailComponent } from './odds-detail.component';
import {NomineesComponent} from '../nominees/nominees.component';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {FormsModule} from '@angular/forms';
import {CategoriesComponent} from '../categories/categories.component';
import {CategoryHopperComponent} from '../category-hopper/category-hopper.component';
import {HomeComponent} from '../home/home.component';
import {VoteMainComponent} from '../vote-main/vote-main.component';
import {OddsMainComponent} from '../odds-main/odds-main.component';
import {VoteDetailComponent} from '../vote-detail/vote-detail.component';
import {CallbackComponent} from '../callback/callback.component';
import {CategoryService} from '../../services/category.service';
import {CategoryServiceStub} from '../../services/category.service.stub';
import {ActivatedRoute} from '@angular/router';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MyAuthService} from '../../services/auth/my-auth.service';
import {AuthServiceStub} from '../../services/auth/auth.service.stub';
import {WinnerMainComponent} from '../winner-main/winner-main.component';
import {WinnerDetailComponent} from '../winner-detail/winner-detail.component';
import {ScoreboardComponent} from '../scoreboard/scoreboard.component';

describe('OddsDetailComponent', () => {
  let component: OddsDetailComponent;
  let fixture: ComponentFixture<OddsDetailComponent>;

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
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OddsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
