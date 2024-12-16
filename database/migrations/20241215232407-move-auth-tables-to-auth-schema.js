'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql('CREATE SCHEMA IF NOT EXISTS auth');
  await db.runSql(`
    ALTER TABLE public.user SET SCHEMA auth;
    ALTER TABLE public.user_refresh_token SET SCHEMA auth;
    ALTER TABLE public.email_verification_code SET SCHEMA auth;
    `);
  await db.runSql(`
    ALTER TABLE auth.user_refresh_token RENAME TO refresh_token;
    `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE auth.refresh_token RENAME TO user_refresh_token;
    `);
  await db.runSql(`
    ALTER TABLE auth.user SET SCHEMA public;
    ALTER TABLE auth.user_refresh_token SET SCHEMA public;
    ALTER TABLE auth.email_verification_code SET SCHEMA public;
    `);
  await db.runSql('DROP SCHEMA IF EXISTS auth');
};

exports._meta = {
  version: 1,
};
