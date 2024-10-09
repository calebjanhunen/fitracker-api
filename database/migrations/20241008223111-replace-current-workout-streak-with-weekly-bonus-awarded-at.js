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
  await db.removeColumn('user_stats', 'current_workout_streak');
  await db.addColumn('user_stats', 'weekly_bonus_awarded_at', {
    type: 'date',
    notNull: false,
  });
  await db.removeColumn('user_stats', 'last_workout_date');
};

exports.down = async function (db) {
  await db.removeColumn('user_stats', 'weekly_bonus_awarded_at');
  await db.addColumn('user_stats', 'current_workout_streak', {
    type: 'int',
    notNull: true,
    defaultValue: 0,
  });
  await db.addColumn('user_stats', 'last_workout_date', {
    type: 'timestamptz',
    notNull: false,
  });
};

exports._meta = {
  version: 1,
};
