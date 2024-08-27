'use strict';

const { table } = require('console');

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
  // Create workout table
  await db.createTable('workout', {
    ifNotExists: true,
    columns: {
      id: {
        type: 'uuid',
        primaryKey: true,
        notNull: true,
        unique: true,
        defaultValue: new String('uuid_generate_v4()'),
      },
      created_at: {
        type: 'datetime',
        notNull: true,
        defaultValue: new String('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'datetime',
        notNull: true,
        defaultValue: new String('CURRENT_TIMESTAMP'),
      },
      name: {
        type: 'string',
        length: 100,
        notNull: true,
      },
      user_id: {
        type: 'uuid',
        notNull: false,
        foreignKey: {
          name: 'fk_user_workout',
          table: 'user',
          mapping: 'id',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        },
      },
    },
  });

  // Create trigger to update updated_at column
  await db.runSql(`
      CREATE TRIGGER update_workout_updated_at
      BEFORE UPDATE ON workout
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `);

  // Create workout_exercise table
  await db.createTable('workout_exercise', {
    ifNotExists: true,
    columns: {
      id: {
        type: 'uuid',
        primaryKey: true,
        notNull: true,
        unique: true,
        defaultValue: new String('uuid_generate_v4()'),
      },
      order: {
        type: 'int',
        notNull: true,
      },
      workout_id: {
        type: 'uuid',
        notNull: true,
        foreignKey: {
          name: 'fk_workout_workout_exercise',
          table: 'workout',
          mapping: 'id',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
          },
        },
      },
      exercise_id: {
        type: 'uuid',
        notNull: true,
        foreignKey: {
          name: 'fk_exercise_workout_exercise',
          table: 'exercise',
          mapping: 'id',
          rules: {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
          },
        },
      },
    },
  });

  // Add unique index for combination of workout_id and exercise_id so multiple of same exercise in a workout is not allowed
  await db.addIndex(
    'workout_exercise',
    'workout_exercise_unique',
    ['workout_id', 'exercise_id'],
    true,
  );
  // Add a unique index on order and workout_id so order value is unique for each workout
  await db.addIndex(
    'workout_exercise',
    'exercise_order_unique',
    ['order', 'workout_id'],
    true,
  );

  // Create workout_set table
  await db.createTable('workout_set', {
    ifNotExists: true,
    columns: {
      id: {
        type: 'uuid',
        primaryKey: true,
        notNull: true,
        unique: true,
        defaultValue: new String('uuid_generate_v4()'),
      },
      workout_exercise_id: {
        type: 'uuid',
        notNull: true,
        foreignKey: {
          name: 'fk_workout_exercise_set',
          table: 'workout_exercise',
          mapping: 'id',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
          },
        },
      },
      order: {
        type: 'int',
        notNull: true,
      },
      weight: {
        type: 'int',
        notNull: true,
      },
      reps: {
        type: 'int',
        notNull: true,
      },
      rpe: {
        type: 'int',
      },
    },
  });

  // Add unique index on order and workout_exercise_id so order value is unique for each workout_exercise
  await db.addIndex(
    'workout_set',
    'set_order_unique',
    ['order', 'workout_exercise_id'],
    true,
  );
};

exports.down = async function (db) {
  await db.dropTable('workout_set');
  await db.dropTable('workout_exercise');
  await db.runSql(`
    DROP TRIGGER IF EXISTS update_workout_updated_at ON workout;
  `);
  await db.dropTable('workout');
};

exports._meta = {
  version: 1,
};
