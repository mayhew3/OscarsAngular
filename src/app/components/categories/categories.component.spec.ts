import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {CategoriesComponent} from './categories.component';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {Router} from '@angular/router';
import {NomineesComponent} from '../nominees/nominees.component';
import {CategoryHopperComponent} from '../category-hopper/category-hopper.component';
import {FormsModule} from '@angular/forms';
import {Location} from '@angular/common';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CategoryService} from '../../services/category.service';
import {CategoryServiceStub} from '../../services/category.service.stub';
import {CallbackComponent} from '../callback/callback.component';
import {HomeComponent} from '../home/home.component';
import {VoteMainComponent} from '../vote-main/vote-main.component';
import {OddsMainComponent} from '../odds-main/odds-main.component';
import {VoteDetailComponent} from '../vote-detail/vote-detail.component';
import {OddsDetailComponent} from '../odds-detail/odds-detail.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SystemVarsService} from '../../services/system.vars.service';
import {SystemVarsServiceStub} from '../../services/system.vars.service.stub';
import {WinnerMainComponent} from '../winner-main/winner-main.component';
import {WinnerDetailComponent} from '../winner-detail/winner-detail.component';

function getHTML(element: DebugElement): Element {
  return element.nativeElement.innerHTML;
}

function getHTMLFromCSSSelector(element: DebugElement, cssSelector: String): Element {
  const debugElement = element.query(By.css('.' + cssSelector));
  return getHTML(debugElement);
}

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let router: Router;
  let location: Location;
  let element: DebugElement;
  let systemVarsService: SystemVarsService;

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
        CallbackComponent],
      providers: [
        {provide: SystemVarsService, useClass: SystemVarsServiceStub},
        {provide: CategoryService, useClass: CategoryServiceStub}
      ]
    });
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    systemVarsService = TestBed.get(SystemVarsService);
    router.initialNavigation();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back with empty path', fakeAsync(() => {
    // noinspection JSIgnoredPromiseFromCall
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/');
  }));

  it ('expect same number of cards as categories', () => {
    const items = element.queryAll(By.css('.card'));
    expect(items.length)
      .toBeGreaterThan(0);
    expect(items.length)
      .toBe(component.categories.length);
    expect(items.length)
      .toBe(3);
  });

  it ('expect category names and points displayed', () => {
    const items = element.queryAll(By.css('.card-body'));

    for (let i = 0; i < items.length; i++) {
      const categoryTitle = getHTMLFromCSSSelector(items[i], 'categoryTitle');
      const categoryPoints = getHTMLFromCSSSelector(items[i], 'categoryPoints');

      expect(categoryTitle).toContain(component.categories[i].name);
      expect(categoryPoints).toContain(component.categories[i].points);
    }
  });
});
