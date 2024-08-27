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
  // Create body_part table
  await db.createTable('body_part', {
    ifNotExists: true,
    columns: {
      id: {
        type: 'int',
        primaryKey: true,
        notNull: true,
        unique: true,
        autoIncrement: true,
      },
      name: {
        type: 'string',
        length: 100,
        notNull: true,
      },
    },
  });

  // Create equipment table
  await db.createTable('equipment', {
    ifNotExists: true,
    columns: {
      id: {
        type: 'int',
        primaryKey: true,
        notNull: true,
        unique: true,
        autoIncrement: true,
      },
      name: {
        type: 'string',
        length: 100,
        notNull: true,
      },
    },
  });

  // Create exercise table
  await db.createTable('exercise', {
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
      body_part_id: {
        type: 'int',
        notNull: true,
        foreignKey: {
          name: 'fk_body_part_exercise',
          table: 'body_part',
          mapping: 'id',
          rules: {
            onDelete: 'SET NULL',
            onUpdate: 'RESTRICT',
          },
        },
      },
      equipment_id: {
        type: 'int',
        notNull: true,
        foreignKey: {
          name: 'fk_equipment_exercise',
          table: 'equipment',
          mapping: 'id',
          rules: {
            onDelete: 'SET NULL',
            onUpdate: 'RESTRICT',
          },
        },
      },
      is_custom: {
        type: 'boolean',
        notNull: true,
        defaultValue: false,
      },
      user_id: {
        type: 'uuid',
        notNull: false,
        foreignKey: {
          name: 'fk_user_exercise',
          table: 'user',
          mapping: 'id',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        },
      },
    },
    ifNotExists: true,
  });

  // Create trigger to update updated_at when exercise is updated
  await db.runSql(`
    CREATE TRIGGER update_exercise_updated_at
    BEFORE UPDATE ON exercise
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DROP TRIGGER IF EXISTS update_exercise_updated_at ON exercise;
  `);
  await db.dropTable('exercise');
  await db.dropTable('equipment');
  await db.dropTable('body_part');
};

exports._meta = {
  version: 1,
};
