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
  // Insert into equipment table

  await db.insert('equipment', ['id', 'name'], [1, 'barbell']);
  await db.insert('equipment', ['id', 'name'], [2, 'dumbbell']);
  await db.insert('equipment', ['id', 'name'], [3, 'cable']);
  await db.insert('equipment', ['id', 'name'], [4, 'machine']);
  await db.insert('equipment', ['id', 'name'], [5, 'bodyweight']);

  // Insert into body_part table
  await db.insert('body_part', ['id', 'name'], [1, 'biceps']);
  await db.insert('body_part', ['id', 'name'], [2, 'triceps']);
  await db.insert('body_part', ['id', 'name'], [3, 'shoulders']);
  await db.insert('body_part', ['id', 'name'], [4, 'chest']);
  await db.insert('body_part', ['id', 'name'], [5, 'back']);
  await db.insert('body_part', ['id', 'name'], [6, 'core']);
  await db.insert('body_part', ['id', 'name'], [7, 'legs']);
  await db.insert('body_part', ['id', 'name'], [8, 'other']);

  // Insert into exercise table
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Bench Press', 4, 1, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Squat', 7, 1, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Deadlift', 5, 1, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Shoulder Press', 3, 2, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Bicep Curl', 1, 2, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Tricep Dips', 2, 5, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Lat Pulldown', 5, 3, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Leg Press', 7, 4, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Plank', 6, 5, false, null],
  );
  await db.insert(
    'exercise',
    ['name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    ['Pull-Up', 5, 5, false, null],
  );
};

exports.down = async function (db) {
  await db.runSql('DELETE FROM exercise');
  await db.runSql('DELETE FROM body_part');
  await db.runSql('DELETE FROM equipment');
};

exports._meta = {
  version: 1,
};
