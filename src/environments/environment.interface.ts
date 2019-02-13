import {HttpClientModule} from '@angular/common/http';

export interface EnvironmentConfig {
  production: boolean;
  httpModules: HttpClientModule[];
  authCallbackUrl: string;
  clientID: string;
  domain: string;
}
