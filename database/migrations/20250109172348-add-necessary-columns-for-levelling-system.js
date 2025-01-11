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
      ALTER TABLE user_stats
      ADD COLUMN level INTEGER NOT NULL DEFAULT 0;
  `);

  await db.runSql(`
    ALTER TABLE user_stats
    ADD COLUMN current_xp INTEGER NOT NULL DEFAULT 0;
  `);

  // populate current_xp and level columns for all users
  await db.runSql(`
    DO $$
    DECLARE
	    row RECORD;
    BEGIN
	    FOR row IN SELECT * FROM user_stats LOOP
		    DECLARE
			    current_level INTEGER := 0;
			    current_xp INTEGER := 0;
			    xp_needed_for_next_level INTEGER := 0;
			    xp_needed_for_current_level INTEGER := 0;
		    BEGIN
			    xp_needed_for_next_level := (current_level + 1) ^ 2 + 200;
			
			    WHILE row.total_xp >= xp_needed_for_next_level LOOP
				    current_level := current_level + 1;
				    xp_needed_for_current_level := xp_needed_for_next_level;
				    xp_needed_for_next_level := xp_needed_for_next_level + (current_level + 1) ^ 2 + 200;
			    END LOOP;
				
			    UPDATE user_stats
			    SET
				    level = current_level,
				    current_xp = row.total_xp - xp_needed_for_current_level
			    WHERE user_id = row.user_id;
		    END;
	    END LOOP;
    END $$
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE user_stats
    DROP COLUMN current_xp;  
  `);

  await db.runSql(`
    ALTER TABLE user_stats
    DROP COLUMN level;  
  `);
};

exports._meta = {
  version: 1,
};
