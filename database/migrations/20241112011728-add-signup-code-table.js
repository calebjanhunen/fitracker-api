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

exports.up = function (db, callback) {
  db.createTable(
    'user_signup_code',
    {
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
        expires_at: {
          type: 'timestamptz',
          notNull: true,
        },
        used_at: {
          type: 'timestamptz',
        },
        email: {
          type: 'string',
          length: 255,
          notNull: true,
          unique: true,
        },
        code: {
          type: 'string',
          length: 6,
          notNull: true,
        },
      },
      ifNotExists: true,
    },
    callback,
  );
  // db.createTable(
  //   'user_signup_code',
  //   {
  //     columns: {
  //       id: {
  //         type: 'int',
  //         primaryKey: true,
  //         notNull: true,
  //         unique: true,
  //         autoIncrement: true,
  //       },
  //       created_at: {
  //         type: 'timestamptz',
  //         notNull: true,
  //         defaultValue: new String('CURRENT_TIMESTAMP'),
  //       },
  //       expires_at: {
  //         type: 'timestamptz',
  //         notNull: true,
  //         defaultValue: new String('CURRENT_TIMESTAMP'),
  //       },
  //       used_at: {
  //         type: 'timestamptz',
  //         defaultValue: null,
  //       },
  //       email: {
  //         type: 'string',
  //         length: 255,
  //         notNull: true,
  //         unique: true,
  //       },
  //       code: {
  //         type: 'string',
  //         length: 6,
  //         notNull: true,
  //       },
  //     },
  //   },
  //   callback,
  // );
};

exports.down = function (db, callback) {
  db.dropTable('user_signup_code', callback);
};

exports._meta = {
  version: 1,
};
