import {Connection, ConnectionOptions, createConnection, DeepPartial, getRepository} from 'typeorm';
import {EntityTarget} from 'typeorm/common/EntityTarget';
import {Category} from './Category';
import {Event} from './Event';
import {FinalResult} from './FinalResult';
import {GroupYear} from './GroupYear';
import {Nomination} from './Nomination';
import {OddsExecution} from './OddsExecution';
import {OddsResult} from './OddsResult';
import {Person} from './Person';
import {PersonGroupRole} from './PersonGroupRole';
import {SystemVars} from './SystemVars';
import {Vote} from './Vote';
import {Winner} from './Winner';
import {PersonGroup} from './PersonGroup';
import {Ceremony} from './Ceremony';
import {CeremonyYear} from './CeremonyYear';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

export class TypeORMManager {
  connection: Connection;
  initialized = false;

  static async createAndCommit<T>(obj: DeepPartial<T>, entityClass: EntityTarget<T>): Promise<DeepPartial<T>> {
    const repository = getRepository(entityClass);
    const entityPre = repository.create(obj);
    // @ts-ignore
    return await repository.save(entityPre);
  }

  private static getOptions(): ConnectionOptions {
    const dbUrl = process.env.DATABASE_URL;

    const baseOptions = {
      type: 'postgres',
      entities: [
        Category,
        Ceremony,
        CeremonyYear,
        Event,
        FinalResult,
        GroupYear,
        Nomination,
        OddsExecution,
        OddsResult,
        Person,
        PersonGroup,
        PersonGroupRole,
        SystemVars,
        Vote,
        Winner
      ],
      synchronize: false,
      logging: true
    };

    if (!dbUrl) {
      return TypeORMManager.getLocalOptions(baseOptions);
    } else {
      return TypeORMManager.getHerokuOptions(baseOptions, dbUrl);
    }
  }

  private static getLocalOptions(baseOptions: any): ConnectionOptions {

    const local_password = process.env.postgres_local_password;
    if (local_password === undefined) {
      throw new Error('Missing required environment variable (for local mode): postgres_local_password');
    }

    const argv = yargs(hideBin(process.argv)).argv;

    baseOptions.host = 'localhost';
    baseOptions.port = argv.port;
    baseOptions.username = 'postgres';
    baseOptions.database = argv.dbName;
    baseOptions.ssl = false;
    baseOptions.password = local_password;

    return baseOptions;
  }

  private static getHerokuOptions(baseOptions: any, url: string): ConnectionOptions {
    baseOptions.url = url;
    baseOptions.ssl = {
      rejectUnauthorized: false
    };
    return baseOptions;
  }

  async init(): Promise<Connection> {
    const options = TypeORMManager.getOptions();

    this.connection = await createConnection(options);
    this.initialized = true;

    return this.connection;
  }

}

export const typeORM = new TypeORMManager();

