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

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let router: Router;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule,
        HttpClientTestingModule],
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back with empty path', fakeAsync(() => {
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/categories');
  }));
});
