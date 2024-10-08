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
  await db.renameColumn(
    'user_stats',
    'current_workout_streak',
    'num_workouts_this_week',
  );

  await db.runSql(`
    UPDATE user_stats
    SET num_Workouts_this_week = 0;
    `);
};

exports.down = async function (db) {
  await db.renameColumn(
    'user_stats',
    'num_workouts_this_week',
    'current_workout_streak',
  );
};

exports._meta = {
  version: 1,
};
