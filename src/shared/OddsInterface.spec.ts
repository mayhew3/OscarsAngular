import {OddsInterface} from './OddsInterface';
import {TestBed} from '@angular/core/testing';

describe('OddsInterface', () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: []
  }));

  it('asPercentage returns itself', () => {
    const result = OddsInterface.fromPercentage(0.25);
    expect(result.asPercentage).toBe(0.25);
  });
});
