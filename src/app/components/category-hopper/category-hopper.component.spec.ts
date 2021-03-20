import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CategoryHopperComponent} from './category-hopper.component';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app-routing.module';
import {CategoriesComponent} from '../categories/categories.component';
import {NomineesComponent} from '../nominees/nominees.component';
import {CategoryService} from '../../services/category.service';
import {CategoryServiceStub} from '../../services/category.service.stub';
import {TestCategoryList} from '../../services/data/categories.test.mock';
import {Category} from '../../interfaces/Category';
import * as _ from 'underscore';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CallbackComponent} from '../callback/callback.component';
import {HomeComponent} from '../home/home.component';
import {VoteMainComponent} from '../vote-main/vote-main.component';
import {OddsMainComponent} from '../odds-main/odds-main.component';
import {VoteDetailComponent} from '../vote-detail/vote-detail.component';
import {OddsDetailComponent} from '../odds-detail/odds-detail.component';
import {ActiveContext} from '../categories.context';
import {WinnerMainComponent} from '../winner-main/winner-main.component';
import {WinnerDetailComponent} from '../winner-detail/winner-detail.component';
import {ScoreboardComponent} from '../scoreboard/scoreboard.component';

describe('CategoryHopperComponent', () => {
  let component: CategoryHopperComponent;
  let fixture: ComponentFixture<CategoryHopperComponent>;
  let element: DebugElement;
  let service: CategoryService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule
      ],
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
        {provide: CategoryService, useClass: CategoryServiceStub}
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryHopperComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement;
    service = TestBed.get(CategoryService);
  });

  function populateInputs(categoryIndex: number) {
    const currentCategory = getCategory(categoryIndex);
    component.nominees = currentCategory ? currentCategory.nominees : [];

    component.next = getCategory(categoryIndex + 1);
    component.prev = getCategory(categoryIndex - 1);
    component.activeContext = ActiveContext.OddsAssignment;

    fixture.detectChanges();
  }

  function getCategory(categoryIndex): Category {
    return categoryIndex >= TestCategoryList.length ? null : TestCategoryList[categoryIndex];
  }

  function findButtonWithText(subElement: DebugElement, textToFind: String): DebugElement {
    const debugElements = subElement.queryAll(By.css('button'));
    return _.find(debugElements, (button) => {
      return button.nativeElement.innerHTML.includes(textToFind);
    });
  }



  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('nominees not populated if no input given', () => {
    expect(component.nominees).toBeFalsy();
    expect(component.next).toBeFalsy();
    expect(component.prev).toBeFalsy();
  });

  it('inputs populated if all exist', () => {
    populateInputs(1);
    expect(component.nominees.length).toBe(3);
    expect(component.next).toBeTruthy();
    expect(component.prev).toBeTruthy();
  });

  it('next empty if last', () => {
    populateInputs(2);
    expect(component.nominees.length).toBe(3);
    expect(component.next).toBeFalsy();
    expect(component.prev).toBeTruthy();
  });

  it('prev empty if first', () => {
    populateInputs(0);
    expect(component.nominees.length).toBe(3);
    expect(component.next).toBeTruthy();
    expect(component.prev).toBeFalsy();
  });

  it('all buttons exist for all inputs', () => {
    populateInputs(1);
    expect(findButtonWithText(element, 'Prev')).toBeTruthy();
    expect(findButtonWithText(element, 'Next')).toBeTruthy();
    expect(findButtonWithText(element, 'Up')).toBeTruthy();
  });

  it('next button disabled if no input', () => {
    populateInputs(2);
    expect(findButtonWithText(element, 'Prev')).toBeTruthy();
    expect(findButtonWithText(element, 'Next')).toBeFalsy();
    expect(findButtonWithText(element, 'Up')).toBeTruthy();
  });

  it('prev button disabled if no input', () => {
    populateInputs(0);
    expect(findButtonWithText(element, 'Prev')).toBeFalsy();
    expect(findButtonWithText(element, 'Next')).toBeTruthy();
    expect(findButtonWithText(element, 'Up')).toBeTruthy();
  });

  it('totalOdds expert', () => {
    populateInputs(1);
    expect(component.totalOdds('expert')).toBe(98);
  });

  it('totalOdds user', () => {
    populateInputs(1);
    expect(component.totalOdds('user')).toBe(81);
  });

  it('totalOddsVegas', () => {
    populateInputs(1);
    expect(component.totalOddsVegas()).toBe(97.06959706959707);
  });

  it('totalOdds unrecognized', () => {
    populateInputs(1);
    expect(component.totalOdds('unrecognized')).toBe(0);
  });

  it('hasChanges is false after inputs', () => {
    populateInputs(1);
    expect(component.hasChanges()).toBe(false);
  });

  it('submit button disabled on init', () => {
    populateInputs(1);
    // tslint:disable-next-line:whitespace
    expect(findButtonWithText(element,'Submit').nativeElement.disabled)
      .toBeTruthy('submit button is enabled');
  });

  it('hasChanges is true after one change', () => {
    populateInputs(1);
    const originalValue = component.nominees[0].odds_expert;

    component.nominees[0].odds_expert = 23;
    expect(component.hasChanges()).toBe(true);

    // reset to initial values for later test runs
    component.nominees[0].odds_expert = originalValue;
  });

  it('hasChanges is true after two different changes', () => {
    populateInputs(1);
    const originalFirst = component.nominees[0].odds_expert;
    const originalSecond = component.nominees[1].odds_expert;

    component.nominees[0].odds_expert = 23;
    component.nominees[1].odds_expert = 3;
    expect(component.hasChanges()).toBe(true);

    // reset to initial values for later test runs
    component.nominees[0].odds_expert = originalFirst;
    component.nominees[1].odds_expert = originalSecond;
  });

  it('hasChanges is false after reverting change', () => {
    populateInputs(1);
    const originalValue = component.nominees[0].odds_expert;

    component.nominees[0].odds_expert = 23;
    component.nominees[0].odds_expert = originalValue;

    expect(component.hasChanges()).toBe(false);
  });

  it('submitOdds calls updateNominee for one change', () => {
    populateInputs(1);
    const originalFirst = component.nominees[0].odds_expert;

    component.nominees[0].odds_expert = 23;

    const updateSpy = spyOn(service, 'updateNominee').and.callThrough();

    component.submitOdds();

    expect(updateSpy).toHaveBeenCalledTimes(1);

    // reset to initial values for later test runs
    component.nominees[0].odds_expert = originalFirst;
  });

  it('submitOdds calls updateNominee twice for two changes', () => {
    populateInputs(1);
    const originalFirst = component.nominees[0].odds_expert;
    const originalSecond = component.nominees[1].odds_expert;

    component.nominees[0].odds_expert = 23;
    component.nominees[1].odds_expert = 3;

    const updateSpy = spyOn(service, 'updateNominee').and.callThrough();

    component.submitOdds();

    expect(updateSpy).toHaveBeenCalledTimes(2);

    // reset to initial values for later test runs
    component.nominees[0].odds_expert = originalFirst;
    component.nominees[1].odds_expert = originalSecond;
  });

  it('submitOdds calls updateNominee once for two changes on one nominee', () => {
    populateInputs(1);
    const originalFirst = component.nominees[0].odds_expert;
    const originalSecond = component.nominees[0].odds_user;

    component.nominees[0].odds_expert = 23;
    component.nominees[0].odds_user = 3;

    const updateSpy = spyOn(service, 'updateNominee').and.callThrough();

    component.submitOdds();

    expect(updateSpy).toHaveBeenCalledTimes(1);

    // reset to initial values for later test runs
    component.nominees[0].odds_expert = originalFirst;
    component.nominees[0].odds_user = originalSecond;
  });

  it('hasChanges is false after submitOdds is called', () => {
    populateInputs(1);
    const originalFirst = component.nominees[0].odds_expert;
    const originalSecond = component.nominees[1].odds_expert;

    component.nominees[0].odds_expert = 23;
    component.nominees[1].odds_expert = 3;

    component.submitOdds();

    expect(component.hasChanges()).toBe(false);

    // reset to initial values for later test runs
    component.nominees[0].odds_expert = originalFirst;
    component.nominees[1].odds_expert = originalSecond;
  });

});
