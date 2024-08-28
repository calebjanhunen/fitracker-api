/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');

module.exports = () => {
  // set the .env.test environment variables (to use test db)
  dotenv.config({ path: '.env.test' });
};
