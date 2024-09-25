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
  await db.createTable('workout_template', {
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
        type: 'timestamptz',
        notNull: true,
        defaultValue: new String('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamptz',
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

  await db.createTable('workout_template_exercise', {
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

  await db.createTable('workout_template_set', {
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
    },
  });
};

exports.down = async function (db) {
  await db.dropTable('workout_template_set');
  await db.dropTable('workout_template_exercise');
  await db.dropTable('workout_template');
};

exports._meta = {
  version: 1,
};
