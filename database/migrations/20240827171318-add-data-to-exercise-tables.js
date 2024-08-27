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
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [1, 'bench press', 4, 1, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [2, 'squat', 7, 1, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [3, 'deadlift', 5, 1, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [4, 'shoulder press', 3, 2, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [5, 'bicep curl', 1, 2, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [6, 'tricep dips', 2, 5, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [7, 'lat pulldown', 5, 3, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [8, 'leg press', 7, 4, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [9, 'plank', 6, 5, false, null],
  );
  await db.insert(
    'exercise',
    ['id', 'name', 'body_part_id', 'equipment_id', 'is_custom', 'user_id'],
    [10, 'pull-up', 5, 5, false, null],
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
