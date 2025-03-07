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
    ALTER TABLE public.user_stats
    ALTER COLUMN level SET DEFAULT 1
  `);

  await db.runSql(`
    UPDATE public.user_stats
    SET level = 1
    WHERE level = 0;  
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE public.user_stats
    ALTER COLUMN level SET DEFAULT 0
  `);
};

exports._meta = {
  version: 1,
};
