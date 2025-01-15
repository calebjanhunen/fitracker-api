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
    CREATE TABLE IF NOT EXISTS auth.role (
      id SERIAL PRIMARY KEY,
      name VARCHAR(20) NOT NULL
    )  
  `);

  await db.runSql(`
    INSERT INTO auth.role (id, name)
    VALUES
      (1, 'user'),  
      (2, 'admin')
  `);

  await db.runSql(`
    ALTER TABLE auth.user
    ADD COLUMN role INT NOT NULL DEFAULT 1,
    ADD CONSTRAINT fk_user_role
    FOREIGN KEY (role)
    REFERENCES auth.role(id)
    ON DELETE RESTRICT
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE auth.user
    DROP CONSTRAINT fk_user_role,
    DROP COLUMN role
  `);

  await db.runSql(`
    DROP TABLE auth.role  
  `);
};

exports._meta = {
  version: 1,
};
