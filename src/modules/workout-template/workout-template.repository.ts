import { Injectable } from '@nestjs/common';
import { DbClient, DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import {
  InsertWorkoutTemplateExerciseModel,
  InsertWorkoutTemplateModel,
  InsertWorkoutTemplateSetModel,
  WorkoutTemplateModel,
} from './models';

@Injectable()
export class WorkoutTemplateRepository {
  private NUM_WORKOUT_TEMPLATE_SET_FIELDS = 2;
  private COLUMNS_AND_JOINS = `
        wt.id,
        wt.name,
        wt.created_at,
        json_agg(json_build_object(
          'exercise_id', COALESCE(e.id, ev.id),
          'exercise_name', COALESCE(e.name, ev.name),
          'order', wte.order,
          'exercise_type', CASE WHEN e.name IS NOT NULL THEN 'exercise' ELSE 'variation' END,
        	'sets', (
        		SELECT json_agg(json_build_object(
                	'id', wts.id,
                  'order', wts.order
            	) ORDER BY wts.order)
            	FROM workout_template_set wts
            	WHERE wts.workout_template_exercise_id = wte.id
            )
        ) ORDER BY wte.order) as exercises
      FROM
        workout_template as wt
      LEFT JOIN workout_template_exercise as wte
        ON wte.workout_template_id = wt.id
      LEFT JOIN exercise e
        ON e.id = wte.exercise_id
      LEFT JOIN exercise_variation ev
        ON ev.id = wte.exercise_variation_id
  `;
  constructor(
    private db: DbService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(WorkoutTemplateRepository.name);
  }

  /**
   * Inserts a workout template along with its exercises and sets.
   * @param {InsertWorkoutTemplateModel} workoutTemplate
   * @param {string} userId
   * @returns {WorkoutTemplateModel}
   *
   * @throws {DatabaseException}
   */
  public async createWorkoutTemplate(
    workoutTemplate: InsertWorkoutTemplateModel,
    userId: string,
  ): Promise<WorkoutTemplateModel> {
    const queryName = 'CreateWorkoutTemplate';
    try {
      const { queryResult } = await this.db.transaction<string>(
        async (client) => {
          const insertedWorkoutTemplateId = await this.insertWorkoutTemplate(
            client,
            workoutTemplate,
            userId,
          );

          for (const exercise of workoutTemplate.exercises) {
            const workoutTemplateExerciseId = await this.insertWorkoutExercise(
              client,
              insertedWorkoutTemplateId,
              exercise,
            );
            await this.insertExerciseSets(
              client,
              workoutTemplateExerciseId,
              exercise.sets,
            );
          }

          return insertedWorkoutTemplateId;
        },
      );

      const createdWorkoutTemplate = await this.findWorkoutTemplateById(
        queryResult,
        userId,
      );

      return createdWorkoutTemplate!;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `);
      throw new DatabaseException(e);
    }
  }

  /**
   * Finds a workout template by id
   * @param {string} workoutTemplateId
   * @param {string} userId
   * @returns {WorkoutTemplateModel | null}
   */
  public async findWorkoutTemplateById(
    workoutTemplateId: string,
    userId: string,
  ): Promise<WorkoutTemplateModel | null> {
    const query = `
      SELECT
        ${this.COLUMNS_AND_JOINS}
      WHERE wt.user_id = $1 AND wt.id = $2
      GROUP BY wt.id
    `;
    const params = [userId, workoutTemplateId];

    try {
      const { queryResult } = await this.db.queryV2<WorkoutTemplateModel>(
        query,
        params,
      );

      if (queryResult.length === 0) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, 'Query FindWorkoutTemplateById failed: ');
      throw new DatabaseException(e);
    }
  }

  public async findAllWorkoutTemplates(
    userId: string,
  ): Promise<WorkoutTemplateModel[]> {
    const query = `
      SELECT
        ${this.COLUMNS_AND_JOINS}
      WHERE wt.user_id = $1
      GROUP BY wt.id
    `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<WorkoutTemplateModel>(
        query,
        params,
      );

      return queryResult;
    } catch (e) {
      this.logger.error(e, 'Query FindAllWorkoutTemplates failed: ');
      throw new DatabaseException(e);
    }
  }

  public async deleteWorkoutTemplate(
    workoutTemplateId: string,
    userId: string,
  ): Promise<void> {
    const query = `
      DELETE FROM workout_template
      WHERE id = $1 AND user_id = $2
    `;
    const params = [workoutTemplateId, userId];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      this.logger.error(e, 'Query DeleteWorkoutTemplate failed: ');
      throw new DatabaseException(e);
    }
  }

  /**
   * Inserts a Workout Template.
   * @param {DbClient} client Database client connection used for transactions
   * @param {InsertWorkoutTemplateModel} workoutTemplate
   * @param {string} userId
   * @returns {string} Id of the inserted workout template.
   */
  private async insertWorkoutTemplate(
    client: DbClient,
    workoutTemplate: InsertWorkoutTemplateModel,
    userId: string,
  ): Promise<string> {
    const now = new Date().toISOString();
    const query = `
          INSERT INTO workout_template (name, user_id, created_at, updated_at)
          VALUES ($1, $2, $3, $3)
          RETURNING id;
        `;
    const params = [workoutTemplate.name, userId, now];
    const result = await client.query<{ id: string }>(query, params);

    return result.rows[0].id;
  }

  /**
   * Inserts a Workout Template Exercise
   * @param {DbClient} client Database client connection used for transactions
   * @param {string} workoutTemplateId
   * @param {InsertWorkoutTemplateExerciseModel} exercise
   * @returns {string} Id of the workout template exercise that was inserted.
   */
  private async insertWorkoutExercise(
    client: DbClient,
    workoutTemplateId: string,
    exercise: InsertWorkoutTemplateExerciseModel,
  ): Promise<string> {
    let query;
    if (exercise.isVariation) {
      query = `
        INSERT INTO workout_template_exercise (workout_template_id, exercise_variation_id, "order")
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
    } else {
      query = `
        INSERT INTO workout_template_exercise (workout_template_id, exercise_id, "order")
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
    }
    const workoutExerciseInsertParams = [
      workoutTemplateId,
      exercise.exerciseId,
      exercise.order,
    ];
    const insertWorkoutExerciseResult = await client.query<{ id: string }>(
      query,
      workoutExerciseInsertParams,
    );
    return insertWorkoutExerciseResult.rows[0].id;
  }

  /**
   * Batch inserts the workout template sets for an individual workout template exercise.
   * @param {DbClient} client Database client connection used for transactions
   * @param {string} workoutTemplateExerciseId
   * @param {InsertWorkoutTemplateSetModel[]} sets
   */
  private async insertExerciseSets(
    client: DbClient,
    workoutTemplateExerciseId: string,
    sets: InsertWorkoutTemplateSetModel[],
  ): Promise<void> {
    // Create the values placeholder for each set in the exercise
    const valuesPlaceHolder = sets.map(
      (_, index) => `
      ($${index * this.NUM_WORKOUT_TEMPLATE_SET_FIELDS + 1}, $${
        index * this.NUM_WORKOUT_TEMPLATE_SET_FIELDS + 2
      })`,
    );

    const query = `
      INSERT INTO workout_template_set ("order", workout_template_exercise_id)
      VALUES ${valuesPlaceHolder}
    `;

    // Create a flat array of each set value
    const params = sets.flatMap((set) => [
      set.order,
      workoutTemplateExerciseId,
    ]);
    await client.query(query, params);
  }
}
