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
  await db.createTable('user_refresh_token', {
    columns: {
      id: {
        type: 'int',
        primaryKey: true,
        notNull: true,
        unique: true,
        autoIncrement: true,
      },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        defaultValue: new String('CURRENT_TIMESTAMP'),
      },
      user_id: {
        type: 'uuid',
        notNull: true,
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
      refresh_token: {
        type: 'string',
        length: 255,
        notNull: true,
      },
      device_id: {
        type: 'string',
        length: 255,
        notNull: true,
      },
    },
    ifNotExists: true,
  });

  await db.addIndex(
    'user_refresh_token',
    'UK_USER_REFRESH_TOKEN_user_id_device_id',
    ['user_id', 'device_id'],
    true,
  );
};

exports.down = async function (db) {
  await db.removeIndex(
    'user_refresh_token',
    'UK_USER_REFRESH_TOKEN_user_id_device_id',
  );
  await db.dropTable('user_refresh_token');
};

exports._meta = {
  version: 1,
};
