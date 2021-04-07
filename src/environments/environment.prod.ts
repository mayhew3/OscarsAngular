import {HttpClientModule} from '@angular/common/http';
import {EnvironmentConfig} from './environment.interface';
import {SocketService} from '../app/services/socket.service';
import {InitSocketService} from '../app/services/init-socket.service';

export const environment: EnvironmentConfig = {
  production: true,
  httpModules: [HttpClientModule],
  socketModule: {provide: SocketService, useClass: SocketService},
  initSocketModule: {provide: InitSocketService, useClass: InitSocketService},
  clientID: 'Re282m5GM0575vOJjhpguBptT8slmIb0',
  domain: 'mayhew3.auth0.com'
};
