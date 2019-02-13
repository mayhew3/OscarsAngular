import {HttpClientModule} from '@angular/common/http';
import {EnvironmentConfig} from './environment.interface';

export const environment: EnvironmentConfig = {
  production: false,
  httpModules: [HttpClientModule],
  authCallbackUrl: 'http://localhost:5000/callback',
  clientID: 'Re282m5GM0575vOJjhpguBptT8slmIb0',
  domain: 'mayhew3.auth0.com'
};
