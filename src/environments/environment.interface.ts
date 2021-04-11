import {HttpClientModule} from '@angular/common/http';

export interface EnvironmentConfig {
  production: boolean;
  httpModules: HttpClientModule[];
  socketModule: any;
  loggerModule: any;
  initSocketModule: any;
  clientID: string;
  domain: string;
}
