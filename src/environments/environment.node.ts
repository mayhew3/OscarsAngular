import {HttpClientModule} from '@angular/common/http';
import {EnvironmentConfig} from './environment.interface';
import {SocketService} from '../app/services/socket.service';
import {InitSocketService} from '../app/services/init-socket.service';
import {LoggerService} from '../app/services/logger.service';

export const environment: EnvironmentConfig = {
  production: false,
  httpModules: [HttpClientModule],
  socketModule: {provide: SocketService, useClass: SocketService},
  loggerModule: {provide: LoggerService, useClass: LoggerService},
  initSocketModule: {provide: InitSocketService, useClass: InitSocketService},
  clientID: 'Re282m5GM0575vOJjhpguBptT8slmIb0',
  domain: 'mayhew3.auth0.com'
};
