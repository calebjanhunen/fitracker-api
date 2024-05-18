// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

module.exports = async () => {
  dotenv.config({ path: '.env.test' });
};
