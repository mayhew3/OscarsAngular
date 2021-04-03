// export for convenience.
export { ActivatedRoute } from '@angular/router';

// #docregion activated-route-stub
import {Params} from '@angular/router';
import {of} from 'rxjs';

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setParamMap()` method to add the next `paramMap` value.
 */
export class ActivatedRouteStub {
  params = of({});

  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }

  /** Set the paramMap observables's next value */
  setParamMap(params?: Params) {
    this.params = of(params);
  }
}
