import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { LoggerService } from 'src/common/logger/logger.service';
import { InsertWorkoutModel, WorkoutModel } from '../models';
import { BaseWorkoutRepository } from './base-workout.repository';

@Injectable()
export class WorkoutRepository extends BaseWorkoutRepository {
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
    private logger: LoggerService,
  ) {
    super();
    this.logger.setContext(WorkoutRepository.name);
  }

  /**
   * @deprecated TODO: Delete once endpoint is no longer in use
   */
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
      const { queryResult } = await this.dbService.queryV2<WorkoutModel>(
        query,
        params,
      );

      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `);
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
      await this.dbService.queryV2(query, params);
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `);
      throw e;
    }
  }

  public async update(
    workoutId: string,
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<void> {
    const queryName = 'UpdateWorkout';
    try {
      await this.dbService.transaction(async (client) => {
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
      });
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `);
      throw e;
    }
  }
}
