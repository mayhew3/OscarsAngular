import {HttpClientModule} from '@angular/common/http';
import {EnvironmentConfig} from './environment.interface';

export const environment: EnvironmentConfig = {
  production: true,
  httpModules: [HttpClientModule],
  authCallbackUrl: 'https://oscars.v2.mayhew3.com/callback',
  clientID: 'Re282m5GM0575vOJjhpguBptT8slmIb0',
  domain: 'mayhew3.auth0.com'
};
