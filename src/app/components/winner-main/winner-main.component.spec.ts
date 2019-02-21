import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerMainComponent } from './winner-main.component';

describe('WinnerMainComponent', () => {
  let component: WinnerMainComponent;
  let fixture: ComponentFixture<WinnerMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinnerMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinnerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
