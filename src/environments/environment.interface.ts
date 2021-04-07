import {HttpClientModule} from '@angular/common/http';

export interface EnvironmentConfig {
  production: boolean;
  httpModules: HttpClientModule[];
  socketModule: any;
  initSocketModule: any;
  clientID: string;
  domain: string;
}
