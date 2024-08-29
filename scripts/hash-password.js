/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const plainTextPwd = process.argv[2];

bcrypt.hash(plainTextPwd, SALT_ROUNDS, (err, hash) => {
  if (err) {
    console.error('Error hashing password: ', err);
  } else {
    console.log('Hashed password: ', hash);
  }
});
