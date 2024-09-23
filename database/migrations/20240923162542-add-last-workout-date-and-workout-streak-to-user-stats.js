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
  await db.addColumn('user_stats', 'last_workout_date', {
    type: 'timestamptz',
    notNull: false,
  });

  await db.runSql(`
    UPDATE user_stats
    SET last_workout_date = (
      SELECT MAX(created_at)
      FROM workout as w
      WHERE w.user_id = user_stats.user_id
    ) 
  `);

  await db.addColumn('user_stats', 'current_workout_streak', {
    type: 'int',
    notNull: true,
    defaultValue: 0,
  });
};

exports.down = async function (db) {
  await db.removeColumn('user_stats', 'current_workout_streak');
  await db.removeColumn('user_stats', 'last_workout_date');
};

exports._meta = {
  version: 1,
};
