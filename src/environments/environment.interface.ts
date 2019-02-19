import {HttpClientModule} from '@angular/common/http';

export interface EnvironmentConfig {
  production: boolean;
  httpModules: HttpClientModule[];
  clientID: string;
  domain: string;
}
