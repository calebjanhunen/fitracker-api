/* eslint-disable @typescript-eslint/no-var-requires */
// FOR MIGRATIONS: see: https://db-migrate.readthedocs.io/en/latest/

const { config } = require('dotenv');
const { resolve } = require('path');

// Load correct .env file
config({
  path:
    process.env.NODE_ENV === 'dev'
      ? resolve(__dirname, '.env')
      : resolve(__dirname, '.env.test'),
});

module.exports = {
  dev: {
    driver: 'pg',
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  },
  test: {
    driver: 'pg',
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  },
};
