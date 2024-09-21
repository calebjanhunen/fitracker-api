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
  await db.createTable('user_stats', {
    user_id: {
      type: 'uuid',
      notNull: false,
      foreignKey: {
        name: 'fk_user_exercise',
        table: 'user',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
    },
    total_xp: {
      type: 'int',
      notNull: true,
      defaultValue: 0,
    },
  });

  // Move data from old column in user table to new table
  await db.runSql(`
    INSERT INTO user_stats (user_id, total_xp)
    SELECT id, total_xp
    FROM "user"  
  `);

  await db.removeColumn('user', 'total_xp');
};

exports.down = async function (db) {
  await db.addColumn('user', 'total_xp', {
    type: 'int',
    notNull: true,
    defaultValue: 0,
  });

  await db.runSql(`
    UPDATE "user"
    SET total_xp = (
      SELECT us.total_xp
      FROM user_stats as us
      WHERE us.user_id = "user".id
    )  
  `);

  await db.dropTable('user_stats', {
    ifExists: true,
  });
};

exports._meta = {
  version: 1,
};
