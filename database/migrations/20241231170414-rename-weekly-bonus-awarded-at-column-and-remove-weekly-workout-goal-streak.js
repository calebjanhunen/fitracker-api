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
    'weekly_bonus_awarded_at',
    'weekly_workout_goal_achieved_at',
  );
  await db.removeColumn('user_stats', 'weekly_workout_goal_streak');
};

exports.down = async function (db) {
  await db.addColumn('user_stats', 'weekly_workout_goal_streak', {
    type: 'int',
    notNull: true,
    defaultValue: 0,
  });
  await db.renameColumn(
    'user_stats',
    'weekly_workout_goal_achieved_at',
    'weekly_bonus_awarded_at',
  );
};

exports._meta = {
  version: 1,
};
