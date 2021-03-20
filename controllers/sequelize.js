const Sequelize = require('sequelize');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const ssl = Boolean(process.env.DATABASE_SSL);
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const argv = yargs(hideBin(process.argv)).argv;
  const local_password = process.env.postgres_local_password;
  const port = argv.port;
  databaseUrl = `postgres://postgres:${local_password}@localhost:${port}/oscars`;
}

const options = {
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

if (ssl) {
  options.ssl = true;
  options.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

exports.sequelize = new Sequelize(databaseUrl, options);

