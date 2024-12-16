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
    CREATE TABLE IF NOT EXISTS public.user_profile (
      id UUID PRIMARY KEY REFERENCES auth.user(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      weekly_workout_goal INTEGER NOT NULL DEFAULT 0
    )
    `);

  // populate user_profile table
  await db.runSql(`
    INSERT INTO public.user_profile (id, first_name, last_name, created_at, updated_at)
    SELECT
      id,
      first_name,
      last_name,
      created_at,
      updated_at
    FROM auth.user;  
  `);

  //remove first name and last name from auth.user
  await db.runSql(`
    ALTER TABLE auth.user
    DROP COLUMN first_name,
    DROP COLUMN last_name  
  `);

  //populate weekly_workout_goal column
  await db.runSql(`
    UPDATE public.user_profile up SET
      weekly_workout_goal = us.weekly_workout_goal
    FROM public.user_stats us
    WHERE us.user_id = up.id
  `);

  //drop weekly_workout_goal from user_stats
  await db.runSql(`
      ALTER TABLE public.user_stats
      DROP COLUMN weekly_workout_goal
  `);
};

exports.down = async function (db) {
  await db.runSql(`
      DROP TRIGGER IF EXISTS after_user_insert ON auth.user;
  `);

  await db.runSql(`
    DROP FUNCTION IF EXISTS create_user_profile;
  `);

  await db.runSql(`
    ALTER TABLE public.user_stats
    ADD COLUMN weekly_workout_goal INTEGER NOT NULL DEFAULT 0
  `);

  await db.runSql(`
    UPDATE public.user_stats us SET
      weekly_workout_goal = up.weekly_workout_goal
    FROM public.user_profile up
    WHERE us.user_id = up.id
  `);

  await db.runSql(`
    ALTER TABLE auth.user
    ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT '' 
  `);
};

exports._meta = {
  version: 1,
};
