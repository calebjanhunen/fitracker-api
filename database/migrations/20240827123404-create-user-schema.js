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
  await db.createTable('user', {
    columns: {
      id: {
        type: 'uuid',
        primaryKey: true,
        notNull: true,
        unique: true,
        defaultValue: new String('uuid_generate_v4()'),
      },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        defaultValue: new String('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamptz',
        notNull: true,
        defaultValue: new String('CURRENT_TIMESTAMP'),
      },
      username: {
        type: 'string',
        length: 50,
        notNull: true,
        unique: true,
      },
      password: {
        type: 'string',
        length: 255,
        notNull: true,
      },
      email: {
        type: 'string',
        length: 255,
        notNull: true,
        unique: true,
      },
      first_name: {
        type: 'string',
        length: 255,
        notNull: true,
      },
      last_name: {
        type: 'string',
        length: 255,
        notNull: true,
      },
    },
    ifNotExists: true,
  });
  await db.runSql(`
      CREATE TRIGGER update_user_updated_at
      BEFORE UPDATE ON "user"
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `);
};

exports.down = async function (db) {
  await db.runSql(
    `
    DROP TRIGGER IF EXISTS update_user_updated_at ON "user";
  `,
  );
  await db.dropTable('user');
};

exports._meta = {
  version: 1,
};
