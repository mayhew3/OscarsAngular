import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { CategoriesComponent } from './categories.component';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {Router} from '@angular/router';
import {NomineesComponent} from '../nominees/nominees.component';
import {CategoryHopperComponent} from '../category-hopper/category-hopper.component';
import {FormsModule} from '@angular/forms';
import {Location} from '@angular/common';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {InMemoryDataService} from '../../services/in-memory-data-service';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let router: Router;
  let location: Location;
  let element: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule,
        HttpClientTestingModule,
        HttpClientInMemoryWebApiModule.forRoot(
          InMemoryDataService, { dataEncapsulation: false, delay: 0 }
        )],
      declarations: [
        CategoriesComponent,
        NomineesComponent,
        CategoryHopperComponent ]
    });
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    location = TestBed.get(Location);
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
    expect(location.path()).toBe('/categories');
  }));

  it('header should say Categories', () => {
    const headerText = element.nativeElement.querySelector('h1').textContent;
    expect(headerText).toContain('Categories');
  });

  it ('expect same number of cards as categories', () => {
    const items = element.queryAll(By.css('.card'));
    expect(items.length)
      .toBeGreaterThan(0);
    expect(items.length)
      .toBe(component.categories.length);
  });
});
