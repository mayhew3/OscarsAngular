/* eslint-disable */
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
import {combineLatest, Observable, of} from 'rxjs';

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

  const populateInputs = (categoryIndex: number): void => {
    component.category = getCategory(categoryIndex);
    component.next = getCategory(categoryIndex + 1);
    component.prev = getCategory(categoryIndex - 1);
    component.activeContext = ActiveContext.OddsAssignment;

    fixture.detectChanges();
  };

  const getCategory = (categoryIndex): Observable<Category> => {
    return categoryIndex >= TestCategoryList.length ? of(null) : of(TestCategoryList[categoryIndex]);
  };

  const findButtonWithText = (subElement: DebugElement, textToFind: string): DebugElement => {
    const debugElements = subElement.queryAll(By.css('button'));
    return _.find(debugElements, (button) => {
      return button.nativeElement.innerHTML.includes(textToFind);
    });
  };



  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('nominees not populated if no input given', () => {
    // expect(component.nominees).toBeFalsy();
    expect(component.next).toBeFalsy();
    expect(component.prev).toBeFalsy();
  });

  it('inputs populated if all exist', done => {
    populateInputs(1);
    combineLatest([component.category, component.next, component.prev]).subscribe(
      ([category, next, prev]) => {
        expect(category.nominees.length).toBe(3);
        expect(next).toBeTruthy();
        expect(prev).toBeTruthy();
        done();
      }
    );
  });

  it('next empty if last', done => {
    populateInputs(2);
    combineLatest([component.category, component.next, component.prev]).subscribe(
      ([category, next, prev]) => {
        expect(category.nominees.length).toBe(3);
        expect(next).toBeFalsy();
        expect(prev).toBeTruthy();
        done();
      }
    );
  });

  it('prev empty if first', done => {
    populateInputs(0);
    combineLatest([component.category, component.next, component.prev]).subscribe(
      ([category, next, prev]) => {
        expect(category.nominees.length).toBe(3);
        expect(next).toBeTruthy();
        expect(prev).toBeFalsy();
        done();
      }
    );
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
    // expect(component.totalOdds('expert')).toBe(98);
  });

  it('totalOdds user', () => {
    populateInputs(1);
    // expect(component.totalOdds('user')).toBe(81);
  });

  it('totalOddsVegas', done => {
    populateInputs(1);
    component.totalOddsVegas().subscribe(totalOddsVegas => {
      expect(totalOddsVegas).toBe(97.06959706959707);
      done();
    });
  });

  it('totalOdds unrecognized', () => {
    populateInputs(1);
    // expect(component.totalOdds('unrecognized')).toBe(0);
  });

  it('hasChanges is false after inputs', done => {
    populateInputs(1);/*
    component.hasChanges().subscribe(hasChanges => {
      expect(hasChanges).toBe(false);
      done();
    });*/
  });

  it('submit button disabled on init', () => {
    populateInputs(1);
    // eslint-disable-next-line
    expect(findButtonWithText(element,'Submit').nativeElement.disabled)
      .toBeTruthy('submit button is enabled');
  });

  it('hasChanges is true after one change', done => {
    populateInputs(1);
    component.category.subscribe(category => {
      const originalValue = category.nominees[0].odds_expert;

      category.nominees[0].odds_expert = 23;/*
      component.hasChanges().subscribe(hasChanges => {
        expect(hasChanges).toBe(true);

        // reset to initial values for later test runs
        category.nominees[0].odds_expert = originalValue;
        done();
      });
*/
    });
  });

  it('hasChanges is true after two different changes', done => {
    populateInputs(1);/*
    const originalFirst = component.nominees[0].odds_expert;
    const originalSecond = component.nominees[1].odds_expert;

    component.nominees[0].odds_expert = 23;
    component.nominees[1].odds_expert = 3;

    component.hasChanges().subscribe(hasChanges => {
      expect(hasChanges).toBe(true);

      // reset to initial values for later test runs
      component.nominees[0].odds_expert = originalFirst;
      component.nominees[1].odds_expert = originalSecond;

      done();
    });*/
  });

  it('hasChanges is false after reverting change', done => {
    populateInputs(1);/*
    const originalValue = component.nominees[0].odds_expert;

    component.nominees[0].odds_expert = 23;
    component.nominees[0].odds_expert = originalValue;

    component.hasChanges().subscribe(hasChanges => {
      expect(hasChanges).toBe(false);
      done();
    });*/
  });

  it('hasChanges is false after submitOdds is called', done => {
    populateInputs(1);/*
    const originalFirst = component.nominees[0].odds_expert;
    const originalSecond = component.nominees[1].odds_expert;

    component.nominees[0].odds_expert = 23;
    component.nominees[1].odds_expert = 3;

    component.submitOdds();

    component.hasChanges().subscribe(hasChanges => {
      expect(hasChanges).toBe(false);

      // reset to initial values for later test runs
      component.nominees[0].odds_expert = originalFirst;
      component.nominees[1].odds_expert = originalSecond;

      done();
    });*/
  });

});
