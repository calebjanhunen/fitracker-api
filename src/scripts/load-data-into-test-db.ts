import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import * as fs from 'fs';
import * as path from 'path';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { User } from 'src/modules/user/models/user.entity';
import { WorkoutTemplateExercise } from 'src/modules/workout-templates/models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from 'src/modules/workout-templates/models/workout-template-set.entity';
import { WorkoutTemplate } from 'src/modules/workout-templates/models/workout-template.entity';
import { DataSource } from 'typeorm';

const entityMap: { [key: string]: EntityClassOrSchema } = {
  users: User,
  exercises: Exercise,
  workoutTemplates: WorkoutTemplate,
  workoutTemplateExercises: WorkoutTemplateExercise,
  workoutTemplateSets: WorkoutTemplateSet,
};

export async function loadDataFromJsonIntoDb(
  filePath: string,
  datasource: DataSource,
) {
  await clearDatabase(datasource);

  // read data from json file
  const rawData = fs.readFileSync(
    path.join(__dirname, '../', filePath),
    'utf-8',
  );
  const jsonData = JSON.parse(rawData);

  const queryRunner = datasource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // loop through json data and insert into respective tables
    for (const [entity, entries] of Object.entries(jsonData)) {
      const entityClass = entityMap[entity];
      for (const entry of entries as { [key: string]: any }[]) {
        const columns = Object.keys(entry)
          .map((key) => `"${key}"`)
          .join(', ');
        const values = Object.values(entry);
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');

        const sql = `INSERT INTO "${
          datasource.getRepository(entityClass).metadata.tableName
        }" (${columns}) VALUES (${placeholders})`;

        await queryRunner.query(sql, values);
      }
    }
    await queryRunner.commitTransaction();
  } catch (e) {
    console.error('Failed to load data:', e);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
}

export async function clearDatabase(datasource: DataSource) {
  const queryRunner = datasource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const allEntities = datasource.entityMetadatas;

  try {
    for (const entity of allEntities) {
      await queryRunner.query(
        `TRUNCATE TABLE ${entity.tableName} RESTART IDENTITY CASCADE`,
      );
    }
    await queryRunner.commitTransaction();
  } catch (e) {
    console.error('Could not clear tables: ', e);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
}
