/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  // set the .env.test environment variables (to use test db)
  dotenv.config({ path: '.env.test' });
  const tsNodePath = path.join(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    'ts-node',
  );

  // run the seed file when the e2e test script is ran
  execSync(`${tsNodePath} ./test/seed-test-db.ts`, { stdio: 'inherit' });
  // const response = execSync('ts-node ./test/seed-test-db.ts');
};
