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
  await db.runSql(`
    ALTER TABLE public.user_profile
    ADD COLUMN username VARCHAR(100) NULL;
  `);

  await db.runSql(`
    UPDATE public.user_profile up
    SET username = u.username
    FROM auth.user u
    WHERE up.id = u.id;
  `);

  await db.runSql(`
    ALTER TABLE public.user_profile
    ALTER COLUMN username SET NOT NULL;  
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE public.user_profile
    REMOVE COLUMN username
  `);
};

exports._meta = {
  version: 1,
};
