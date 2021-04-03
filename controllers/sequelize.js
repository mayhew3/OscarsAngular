const Sequelize = require('sequelize');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

if (process.env.DATABASE_SSL === undefined) {
  throw new Error('Missing required environment variable: DATABASE_SSL');
}

const ssl = process.env.DATABASE_SSL === 'true';
let databaseUrl = process.env.DATABASE_URL;

const options = {
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

if (!databaseUrl) {
  const argv = yargs(hideBin(process.argv)).argv;
  const local_password = process.env.postgres_local_password;
  options.port = argv.port;
  exports.sequelize = new Sequelize('oscars', 'postgres', local_password, options);
} else {
  exports.sequelize = new Sequelize(databaseUrl, options);
}


