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
    CREATE TABLE IF NOT EXISTS public.exercise_variation (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      exercise_id UUID NOT NULL,
      name VARCHAR(40) NOT NULL,
      notes VARCHAR(255) NULL,
      user_id UUID NOT NULL,
      CONSTRAINT fk_exercise FOREIGN KEY (exercise_id)
      REFERENCES public.exercise (id) ON DELETE RESTRICT,
      CONSTRAINT fk_user_profile FOREIGN KEY (user_id)
      REFERENCES public.user_profile (id) ON DELETE CASCADE
    )  
  `);

  await db.runSql(`
    ALTER TABLE PUBLIC.workout_exercise
    ADD COLUMN exercise_variation_id UUID NULL,
    ADD CONSTRAINT fk_exercise_variation FOREIGN KEY (exercise_variation_id)
    REFERENCES public.exercise_variation (id) ON DELETE CASCADE
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE public.workout_exercise
    DROP COLUMN exercise_variation_id  
  `);

  await db.runSql(`
    DROP TABLE IF EXISTS public.exercise_variation  
  `);
};

exports._meta = {
  version: 1,
};
