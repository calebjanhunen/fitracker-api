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
  // add funciton to update updated_at on workout table if workout_exercise is updated
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_workout_updated_at_from_workout_exercise()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE workout
      SET updated_at = NOW()
      WHERE id = NEW.workout_id;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // add function to update updated_at on workout table if workout_set is updated
  await db.runSql(`
    CREATE OR REPLACE FUNCTION update_workout_updated_at_from_set()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE workout
      SET updated_at = NOW()
      WHERE id = (SELECT workout_id FROM workout_exercise WHERE id = NEW.workout_exercise_id);

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // add trigger to workout_exercise table
  await db.runSql(`
    CREATE TRIGGER workout_exercise_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON workout_exercise
    FOR EACH ROW
    EXECUTE FUNCTION update_workout_updated_at_from_workout_exercise();
  `);

  // Add trigger to workout_set table
  await db.runSql(`
    CREATE TRIGGER workout_set_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON workout_set
    FOR EACH ROW
    EXECUTE FUNCTION update_workout_updated_at_from_set();
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DROP TRIGGER IF EXISTS workout_exercise_update_trigger ON workout_exercise;
  `);
  await db.runSql(`
    DROP TRIGGER IF EXISTS workout_set_update_trigger ON workout_set;
  `);
  await db.runSql(`
    DROP FUNCTION IF EXISTS update_workout_updated_at_from_workout_exercise;
  `);
  await db.runSql(`
    DROP FUNCTION IF EXISTS update_workout_updated_at_from_workout_set;
  `);
};

exports._meta = {
  version: 1,
};
