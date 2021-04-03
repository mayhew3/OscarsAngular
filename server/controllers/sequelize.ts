import Sequelize from 'sequelize';
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

if (process.env.DATABASE_SSL === undefined) {
  throw new Error('Missing required environment variable: DATABASE_SSL');
}

const ssl = process.env.DATABASE_SSL === 'true';
let databaseUrl = process.env.DATABASE_URL;

const options: Sequelize.Options = {
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
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

function createConnection(databaseUrl?: string): Sequelize.Sequelize {
  if (!databaseUrl) {
    const argv = yargs(hideBin(process.argv)).argv;
    const local_password = process.env.postgres_local_password;
    options.port = argv.port;
    return new Sequelize.Sequelize('oscars', 'postgres', local_password, options);
  } else {
    return new Sequelize.Sequelize(databaseUrl, options);
  }
}

