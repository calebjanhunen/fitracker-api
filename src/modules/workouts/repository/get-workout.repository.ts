import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions';
import { LoggerService } from 'src/common/logger/logger.service';
import {
  WorkoutExerciseModel,
  WorkoutModel,
  WorkoutSummaryModel,
} from '../models';

@Injectable()
export class GetWorkoutRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetWorkoutRepository.name);
  }

  public async getWorkoutById(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutModel | null> {
    const queryName = 'getWorkoutById';
    const query = `
      SELECT
      	w.id,
      	w.name,
      	w.created_at AS workout_date,
      	w.duration,
      	w.gained_xp
      FROM
      	workout w
      WHERE
      	w.id = $1
      	AND w.user_id = $2
    `;
    const params = [workoutId, userId];

    try {
      const { queryResult } = await this.db.queryV2<WorkoutModel>(
        query,
        params,
      );

      if (!queryResult.length) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }

  public async getExercisesForWorkout(
    workoutId: string,
  ): Promise<WorkoutExerciseModel[]> {
    const queryName = 'getExercisesForWorkout';
    const query = `
      SELECT
      	COALESCE(we.exercise_id, we.exercise_variation_id) AS exercise_id,
      	COALESCE(e.name, ev.name) AS name,
      	we.order,
      	json_agg(
      		json_build_object('id', ws.id, 'order', ws.order, 'reps', ws.reps, 'weight', ws.weight, 'rpe', ws.rpe)
      		ORDER BY
      			ws.order
      	) AS sets
      FROM
      	workout_exercise we
      	LEFT JOIN exercise e ON e.id = we.exercise_id
      	LEFT JOIN exercise_variation ev ON ev.id = we.exercise_variation_id
      	INNER JOIN workout_set ws ON ws.workout_exercise_id = we.id
      WHERE
      	we.workout_id = $1
      GROUP BY
      	we.exercise_id,
      	we.exercise_variation_id,
      	e.name,
      	ev.name,
      	we.order
      ORDER BY
      	we.order
    `;
    const params = [workoutId];

    try {
      const { queryResult } = await this.db.queryV2<WorkoutExerciseModel>(
        query,
        params,
      );

      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }

  /**
   * Gets the number of days where a workout is completed this week
   * @param {string} userId
   * @param {Date} currentDate
   * @returns {number}
   *
   * @throws {DatabaseException}
   */
  public async getDaysWithWorkoutsThisWeek(
    userId: string,
    currentDate: Date,
  ): Promise<number> {
    const query = `
        SELECT
          COUNT(DISTINCT(DATE(w.created_at)))
        FROM workout w
        WHERE w.user_id = $1
        AND DATE(w.created_at) >= ($2::date - INTERVAL '1 day' * (EXTRACT(DOW FROM $2::date)::int))::date
      `;
    const params = [userId, currentDate];

    try {
      const { queryResult } = await this.db.queryV2<{ count: number }>(
        query,
        params,
      );
      return Number(queryResult[0].count);
    } catch (e) {
      this.logger.error(
        e,
        `Query getNumberOfDaysWhereAWorkoutWasCompletedThisWeek failed: `,
      );
      throw new DatabaseException(e.message);
    }
  }

  public async getWorkoutsByDate(
    date: Date,
    userId: string,
  ): Promise<WorkoutModel[]> {
    const query = `
      SELECT
      	w.id,
      	w.name,
      	w.created_at AS workout_date,
      	w.duration,
      	w.gained_xp
      FROM
      	workout w
        WHERE w.user_id = $1
        AND Date(w.created_at) = Date($2)
      `;
    const params = [userId, date];

    try {
      const { queryResult } = await this.db.queryV2<WorkoutModel>(
        query,
        params,
      );
      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query getWorkoutsByDate failed: `);
      throw new DatabaseException(e.message);
    }
  }

  public async getWorkoutSummariesWithoutSetCount(
    userId: string,
  ): Promise<WorkoutSummaryModel[]> {
    const queryName = 'getWorkoutSummaries';
    const query = `
        SELECT
        	w.id,
        	w.name,
        	w.created_at,
        	w.duration,
        	w.gained_xp,
        	json_agg(
        		json_build_object('workout_exercise_id', we.id, 'exercise_id', COALESCE(e.id, ev.id), 'name', COALESCE(e.name, ev.name))
        		ORDER BY
        			we.order
        	) AS exercises
        FROM
        	workout w
        	INNER JOIN workout_exercise we ON we.workout_id = w.id
        	LEFT JOIN exercise e ON e.id = we.exercise_id
        	LEFT JOIN exercise_variation ev ON ev.id = we.exercise_variation_id
        WHERE
        	w.user_id = $1
        GROUP BY
        	w.id
    `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<WorkoutSummaryModel>(
        query,
        params,
      );

      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }

  public async getNumberOfSetsForExercises(
    workoutIds: string[],
    userId: string,
  ): Promise<{ workoutExerciseId: string; numberOfSets: number }[]> {
    const queryName = 'getNumberOfSetsForExercises';
    const query = `
        SELECT
        	we.id as workout_exercise_id,
        	COUNT(ws.*)::INT AS number_of_sets
        FROM
        	workout_exercise we
        	INNER JOIN workout_set ws ON ws.workout_exercise_id = we.id
        	INNER JOIN workout w ON w.id = we.workout_id
        WHERE
        	we.workout_id = ANY($1)
        	AND w.user_id = $2
        GROUP BY
        	we.id
    `;
    const params = [workoutIds, userId];

    try {
      const { queryResult } = await this.db.queryV2<{
        workoutExerciseId: string;
        numberOfSets: number;
      }>(query, params);

      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }
}
