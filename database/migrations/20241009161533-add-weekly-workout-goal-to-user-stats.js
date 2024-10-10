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
  await db.addColumn('user_stats', 'weekly_workout_goal', {
    type: 'int',
    notNull: false,
    defaultValue: 0,
  });
};

exports.down = async function (db) {
  await db.removeColumn('user_stats', 'weekly_workout_goal');
};

exports._meta = {
  version: 1,
};
