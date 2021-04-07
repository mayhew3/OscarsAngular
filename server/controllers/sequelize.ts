import Sequelize from 'sequelize';
import {types} from 'util';
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

class CustomDecimal extends (Sequelize.DataTypes.DECIMAL as Sequelize.DataTypes.NumberDataTypeConstructor) {
  static parse(value: string): number {
    return +value;
  }
}

const createConnection = (dbUrl?: string): Sequelize.Sequelize => {
  if (!dbUrl) {
    const argv = yargs(hideBin(process.argv)).argv;
    const local_password = process.env.postgres_local_password;
    options.port = argv.port;
    return new Sequelize.Sequelize('oscars', 'postgres', local_password, options);
  } else {
    return new Sequelize.Sequelize(dbUrl, options);
  }
};

let typesUpdated = false;

if (process.env.DATABASE_SSL === undefined) {
  throw new Error('Missing required environment variable: DATABASE_SSL');
}

const ssl = process.env.DATABASE_SSL === 'true';
const databaseUrl = process.env.DATABASE_URL;

const options: Sequelize.Options = {
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  hooks: {
    afterConnect(): Promise<void> | void {
      if (!typesUpdated) {
        console.log('afterConnect called.');
        const dTypes = {
          DECIMAL: CustomDecimal
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any as Sequelize.Sequelize).connectionManager.refreshTypeParser(dTypes);
        typesUpdated = true;
      }
    }
  }
};

if (ssl === true) {
  options.ssl = true;
  options.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

export const sequelize = createConnection(databaseUrl);
