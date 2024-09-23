import { Inject, Injectable } from '@nestjs/common';
import { DbClient, DbService } from 'src/common/database';
import { MyLoggerService } from 'src/common/logger/logger.service';
import {
  InsertWorkoutExerciseModel,
  InsertWorkoutModel,
  InsertWorkoutSetModel,
  WorkoutModel,
} from '../models';

@Injectable()
export class WorkoutRepository {
  private readonly NUM_SET_VALUES = 5;
  private readonly COLUMNS_AND_JOINS = `
        w.id,
        w.name,
        w.created_at,
        w.duration,
        w.gained_xp,
        json_agg(json_build_object(
        	'id', e.id,
        	'name', e.name,
          'order', we.order,
        	'sets', (
        		SELECT json_agg(json_build_object(
                	'id', ws.id,
                  'order', ws.order,
                	'reps', ws.reps,
                	'weight', ws.weight,
                	'rpe', ws.rpe
            	) ORDER BY ws.order)
            	FROM workout_set ws
            	WHERE ws.workout_exercise_id = we.id
            )
        ) ORDER BY we.order) as exercises
      FROM
        workout as w
      LEFT JOIN
	      workout_exercise as we ON we.workout_id = w.id
      LEFT JOIN
	      exercise as e ON e.id = we.exercise_id
  `;

  constructor(
    private readonly dbService: DbService,
    @Inject('WorkoutRepoLogger') private readonly logger: MyLoggerService,
  ) {}

  /**
   * Saves a workout.
   * @param {InsertWorkoutModel} workout
   * @returns {WorkoutModel} Saved Workout
   *
   * @throws {CouldNotSaveWorkoutException}
   */
  public async create(
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<WorkoutModel> {
    const queryName = 'CreateWorkout';
    try {
      const { queryResult, elapsedTime } =
        await this.dbService.transaction<string>(async (client) => {
          const insertedWorkoutId = await this.insertWorkout(
            client,
            workout,
            userId,
          );

          for (const exercise of workout.exercises) {
            const workoutExerciseId = await this.insertWorkoutExercise(
              client,
              insertedWorkoutId,
              exercise,
            );
            await this.insertExerciseSets(
              client,
              workoutExerciseId,
              exercise.sets,
            );
          }

          return insertedWorkoutId;
        });

      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);

      const createdWorkout = await this.findById(queryResult, userId);
      if (!createdWorkout) {
        throw new Error('Could not find created workout.');
      }

      return createdWorkout;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  /**
   * Finds a workout by id and returns as WorkoutModel
   * @param {string} workoutId
   * @param {string} userId
   * @returns {WorkoutModel | null}
   */
  public async findById(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutModel | null> {
    const queryName = 'GetWorkoutById';
    const query = `
      SELECT
        ${this.COLUMNS_AND_JOINS}
      WHERE w.user_id = $1 AND w.id = $2
      GROUP BY w.id
    `;
    const params = [userId, workoutId];

    try {
      const { queryResult, elapsedTime } =
        await this.dbService.queryV2<WorkoutModel>(query, params);
      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);

      if (queryResult.length === 0) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  public async findAll(userId: string): Promise<WorkoutModel[]> {
    const queryName = 'GetAllWorkouts';
    const query = `
      SELECT
        ${this.COLUMNS_AND_JOINS}
      WHERE w.user_id = $1
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `;
    const params = [userId];

    try {
      const { queryResult, elapsedTime } =
        await this.dbService.queryV2<WorkoutModel>(query, params);
      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);

      return queryResult;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  public async delete(workoutId: string, userId: string): Promise<void> {
    const queryName = 'DeleteWorkout';
    const query = `
      DELETE FROM workout
      WHERE
        user_id = $1 AND id = $2
    `;
    const params = [userId, workoutId];

    try {
      const { elapsedTime } = await this.dbService.queryV2(query, params);
      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  public async update(
    workoutId: string,
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<WorkoutModel> {
    const queryName = 'UpdateWorkout';
    try {
      const { elapsedTime } = await this.dbService.transaction(
        async (client) => {
          // Update using kill and fill due to ability to remove and add sets & exercsies
          // TODO: Change from kill and fill

          // Update workout to maintain id, created_at & updated_at
          const updateQuery = `
        UPDATE workout
        SET
        name = $1
        WHERE
          id = $2 AND user_id = $3
          `;
          const updateParams = [workout.name, workoutId, userId];
          await client.query(updateQuery, updateParams);

          // Delete workout exercises & sets
          const deleteQuery = `
          DELETE FROM workout_exercise
          WHERE
          workout_id = $1
          `;
          const deleteParams = [workoutId];
          await client.query(deleteQuery, deleteParams);

          // Insert workout exercises and sets
          for (const exercise of workout.exercises) {
            const workoutExerciseId = await this.insertWorkoutExercise(
              client,
              workoutId,
              exercise,
            );
            await this.insertExerciseSets(
              client,
              workoutExerciseId,
              exercise.sets,
            );
          }
        },
      );

      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }

    const updatedWorkout = await this.findById(workoutId, userId);
    if (!updatedWorkout) {
      throw new Error('Could not find updated workout');
    }
    return updatedWorkout;
  }

  /**
   * Inserts a Workout.
   * @param {DbClient} client Database client connection used for transactions
   * @param {InsertWorkoutModel} workout
   * @param {string} userId
   * @returns {string} Id of the inserted workout.
   */
  private async insertWorkout(
    client: DbClient,
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<string> {
    const query = `
          INSERT INTO workout (name, user_id, created_at, updated_at, duration, gained_xp)
          VALUES ($1, $2, $3, $3, $4, $5)
          RETURNING id;
        `;
    const params = [
      workout.name,
      userId,
      workout.createdAt,
      workout.duration,
      workout.gainedXp,
    ];
    const result = await client.query<{ id: string }>(query, params);

    return result.rows[0].id;
  }

  /**
   * Inserts a workout exercise
   * @param {DbClient} client Database client connection used for transactions
   * @param {string} workoutId
   * @param {InsertWorkoutExerciseModel} exercise
   * @returns {string} Id of the workout exercise that was inserted.
   */
  private async insertWorkoutExercise(
    client: DbClient,
    workoutId: string,
    exercise: InsertWorkoutExerciseModel,
  ): Promise<string> {
    const workoutExerciseInsertQuery = `
          INSERT INTO workout_exercise (workout_id, exercise_id, "order")
          VALUES ($1, $2, $3)
          RETURNING id;
        `;
    const workoutExerciseInsertParams = [
      workoutId,
      exercise.exerciseId,
      exercise.order,
    ];
    const insertWorkoutExerciseResult = await client.query<{ id: string }>(
      workoutExerciseInsertQuery,
      workoutExerciseInsertParams,
    );
    return insertWorkoutExerciseResult.rows[0].id;
  }

  /**
   * Batch inserts the sets for an individual workout exercise.
   * @param {DbClient} client Database client connection used for transactions
   * @param {string} workoutExerciseId
   * @param {InsertWorkoutSetModel[]} sets
   */
  private async insertExerciseSets(
    client: DbClient,
    workoutExerciseId: string,
    sets: InsertWorkoutSetModel[],
  ): Promise<void> {
    // Create the values placeholder for each set in the exercise
    const valuesPlaceHolder = sets.map(
      (_, index) => `
      ($${index * this.NUM_SET_VALUES + 1}, $${
        index * this.NUM_SET_VALUES + 2
      }, $${index * this.NUM_SET_VALUES + 3}, $${
        index * this.NUM_SET_VALUES + 4
      }, $${index * this.NUM_SET_VALUES + 5})
    `,
    );

    const query = `
      INSERT INTO workout_set ("order", weight, reps, rpe, workout_exercise_id)
      VALUES ${valuesPlaceHolder}
    `;

    // Create a flat array of each set value
    const params = sets.flatMap((set) => [
      set.order,
      set.weight,
      set.reps,
      set.rpe,
      workoutExerciseId,
    ]);
    await client.query(query, params);
  }
}
