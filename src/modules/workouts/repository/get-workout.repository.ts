import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions';
import { LoggerService } from 'src/common/logger/logger.service';
import { WorkoutSummaryModel } from '../models';

@Injectable()
export class GetWorkoutRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetWorkoutRepository.name);
  }

  public async getWorkoutSummaries(
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
        	LEFT JOIN workout_exercise we ON we.workout_id = w.id
        	LEFT JOIN exercise e ON e.id = we.exercise_id
        	LEFT JOIN exercise_variation ev ON ev.id = we.exercise_variation_id
        	LEFT JOIN workout_set ws ON ws.workout_exercise_id = we.id
        WHERE
        	w.user_id = $1
        GROUP BY
        	w.id
    `;
    const params = [userId];

    try {
      const { queryResult, elapsedTime } =
        await this.db.queryV2<WorkoutSummaryModel>(query, params);
      this.logger.log(`Query ${queryName} took ${elapsedTime} ms`, {
        queryName,
        elapsedTime,
      });

      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }

  public async getNumberOfSetsForExercises(
    workoutExerciseIds: string[],
    userId: string,
  ): Promise<{ workoutExerciseId: string; numberOfSets: number }[]> {
    const queryName = 'getNumberOfSetsForExercises';
    const query = `
        SELECT
        	we.id,
        	COUNT(ws.*) AS number_of_sets
        FROM
        	workout_exercise we
        	INNER JOIN workout_set ws ON ws.workout_exercise_id = we.id
        	INNER JOIN workout w ON w.id = we.workout_id
        WHERE
        	we.id = ANY($1)
        	AND w.user_id = $2
        GROUP BY
        	we.id
    `;
    const params = [workoutExerciseIds, userId];

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
