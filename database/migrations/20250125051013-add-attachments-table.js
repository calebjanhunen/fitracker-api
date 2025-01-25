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
    CREATE TABLE IF NOT EXISTS public.cable_attachment (
      id SERIAL PRIMARY KEY,
      name VARCHAR(30) NOT NULL
    )  
  `);

  await db.runSql(`
    INSERT INTO public.cable_attachment (id, name) VALUES
      (1, 'Straight Bar'),
      (2, 'Single Rope'),
      (3, 'Double Rope'),
      (4, 'V Bar'),
      (5, 'Close Grip Triangle Handle'),
      (6, 'D Handle'),
      (7, 'Ankle Strap'),
      (8, 'Wrist Strap'),
      (9, 'EZ Bar'),
      (10, 'Wide Grip Lat Pulldown'),
      (11, 'Neutral Grip Lat Pulldown'),
      (12, 'Other')
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DROP TABLE public.cable_attachment  
  `);
};

exports._meta = {
  version: 1,
};
