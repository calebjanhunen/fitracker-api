import { Inject, Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { MyLoggerService } from 'src/common/logger/logger.service';
import {
  ExerciseModel,
  InsertExerciseModel,
  NumTimesUsedForExerciseModel,
  RecentSetsForExerciseModel,
} from '../models';
import { ExerciseDetailsModel } from '../models/exercise-details.model';

@Injectable()
export class ExerciseRepository {
  private readonly COLUMNS_AND_JOINS = `
     e.id,
        e.name,
        bp.name as body_part,
        eq.name as equipment,
        e.is_custom
      FROM exercise e
      INNER JOIN body_part bp
      ON bp.id = e.body_part_id
      INNER JOIN equipment eq
      ON eq.id = e.equipment_id
  `;
  constructor(
    private readonly db: DbService,
    @Inject('ExerciseRepoLogger') private readonly logger: MyLoggerService,
  ) {}

  /**
   * Creates a new exercise.
   * @param {InsertExerciseModel} exercise
   * @returns {ExerciseModel}
   *
   * @throws {DatabaseException}
   */
  public async create(exercise: InsertExerciseModel): Promise<ExerciseModel> {
    const queryName = 'CreateExercise';
    const query = `
        INSERT INTO exercise (name, body_part_id, equipment_id, is_custom, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `;
    const values = [
      exercise.name,
      exercise.bodyPartId,
      exercise.equipmentId,
      exercise.isCustom,
      exercise.userId,
    ];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseModel>(
        query,
        values,
      );

      if (queryResult.length === 0) {
        throw new Error('Could not create exercise');
      }

      const createdExercise = await this.findById(
        queryResult[0].id,
        exercise.userId,
      );
      if (!createdExercise) {
        throw new Error('Could not find created exercise');
      }

      return createdExercise;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  /**
   * This function gets all default exercises and custom exercises for a user
   * @param {string} userId   ID of the user
   * @returns {Exercise[]}    Array of exercises
   *
   * @throws {DatabaseException}
   */
  public async findAll(userId: string): Promise<ExerciseModel[]> {
    const queryName = 'FindAllExercises';
    const query = `
      SELECT
        e.id,
        e.name,
        bp.name as body_part,
        eq.name as equipment,
        e.is_custom
      FROM exercise e
      INNER JOIN body_part bp
      ON bp.id = e.body_part_id
      INNER JOIN equipment eq
      ON eq.id = e.equipment_id
      WHERE is_custom = false
      OR user_id = $1
      ORDER BY e.name
    `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseModel>(
        query,
        params,
      );

      return queryResult;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  /**
   * Gets an exercise by its id if it's default and id and userId if it's custom
   * @param {string} exerciseId
   * @param {string} userId
   * @returns {ExerciseModel | null}
   *
   * @throws {DatabaseException}
   */
  public async findById(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseModel | null> {
    const queryName = 'FindExerciseById';
    const query = `
      SELECT
        e.id,
        e.name,
        bp.name as body_part,
        eq.name as equipment,
        e.is_custom
      FROM exercise e
      INNER JOIN body_part bp
      ON bp.id = e.body_part_id
      INNER JOIN equipment eq
      ON eq.id = e.equipment_id
      WHERE
        (e.is_custom = false AND e.id = $1)
      OR
        (e.id = $1 AND e.user_id = $2)
    `;
    const params = [exerciseId, userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseModel>(
        query,
        params,
      );
      if (queryResult.length === 0) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  public async findByIds(
    ids: string[],
    userId: string,
  ): Promise<ExerciseModel[]> {
    const queryName = 'FindExercisesByIds';
    const query = `
      SELECT
        ${this.COLUMNS_AND_JOINS}
      WHERE
        e.id = ANY ($1::uuid[]) AND is_custom = false OR
        e.id = ANY ($1::uuid[]) AND user_id = $2
    `;
    const params = [ids, userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseModel>(
        query,
        params,
      );

      return queryResult;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  /**
   * Gets an exercise along with it's details
   * @param {string} exerciseId
   * @param {string} userId
   * @returns {ExerciseDetailsModel | null}
   *
   * @throws {DatabaseException}
   */
  public async getExerciseDetails(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseDetailsModel | null> {
    const query = `
      SELECT
	      e.name,
	      json_agg(
		      json_build_object(
			      'workout_name', w.name,
			      'workout_date', w.created_at,
			      'sets', (
				      SELECT json_agg(
					      json_build_object(
						    'reps', ws.reps,
						    'weight', ws.weight,
						    'rpe', ws.rpe,
						    'order', ws.order
					    ) ORDER BY ws.order
				    )
				    FROM workout_set as ws
				    WHERE ws.workout_exercise_id = we.id
			    )
		    ) ORDER BY w.created_at DESC
	    ) as workout_details
      FROM exercise as e
      INNER JOIN workout_exercise we ON we.exercise_id = e.id
      INNER JOIN workout w ON w.id = we.workout_id
      WHERE (is_custom = false AND e.id = $1) OR
            (is_custom = true AND e.id = $1 AND e.user_id = $2)
      GROUP BY e.name
    `;
    const params = [exerciseId, userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseDetailsModel>(
        query,
        params,
      );

      if (!queryResult.length) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error('Query getExerciseDetails failed: ', e);
      throw new DatabaseException(e.message);
    }
  }

  /**
   * Deletes an existing exercise.
   * @param {string} exerciseId
   * @param {string} userId
   *
   * @throws {DatabaseException}
   */
  public async delete(exerciseId: string, userId: string): Promise<void> {
    const queryName = 'DeleteExercise';
    const query = `
      DELETE FROM exercise
      WHERE
        id = $1 AND user_id = $2
    `;
    const params = [exerciseId, userId];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  /**
   * Updates an exercise.
   * @param {string} exerciseId
   * @param {InsertExerciseModel} exercise
   * @param {string} userId
   * @returns {ExerciseModel}
   *
   * @throws {DatabaseException}
   */
  public async update(
    exerciseId: string,
    exercise: InsertExerciseModel,
    userId: string,
  ): Promise<ExerciseModel> {
    const query = `
      UPDATE exercise
      SET
        name = $2,
        body_part_id = $3,
        equipment_id = $4
      WHERE
        id = $1 AND user_id = $5
      RETURNING id;
    `;
    const params = [
      exerciseId,
      exercise.name,
      exercise.bodyPartId,
      exercise.equipmentId,
      userId,
    ];

    const { queryResult } = await this.db.queryV2<ExerciseModel>(query, params);

    const updatedExercise = await this.findById(queryResult[0].id, userId);
    if (!updatedExercise) {
      throw new Error('Could not find updated exercise');
    }
    return updatedExercise;
  }

  /**
   * Gets the sets from the most recent workout that each exercise was used
   *
   * @param {string} userId
   * @returns {RecentSetsForExerciseModel[]}
   */
  public async getRecentSetsForExercises(
    userId: string,
  ): Promise<RecentSetsForExerciseModel[]> {
    const queryName = 'GetRecentSetsForExercises';

    const query = `
      WITH recent_workouts AS (
	      SELECT
	        we.exercise_id,
	        MAX(w.created_at) as most_recent_date
	      FROM workout as w
	      INNER JOIN workout_exercise we ON we.workout_id = w.id
	      GROUP BY we.exercise_id
      )

      SELECT
	      we.exercise_id as id,
	      json_agg(json_build_object(
		      'id', ws.id,
		      'weight', ws.weight,
		      'reps', ws.reps,
		      'rpe', ws.rpe
	      ) ORDER BY ws.order) as recent_sets
	      FROM workout_exercise as we
	      INNER JOIN workout w ON w.id = we.workout_id
	      INNER JOIN workout_set ws ON we.id = ws.workout_exercise_id
	      INNER JOIN recent_workouts rw ON rw.exercise_id = we.exercise_id AND rw.most_recent_date = w.created_at
        INNER JOIN exercise e ON e.id = we.exercise_id
        WHERE w.user_id = $1
	      GROUP BY we.exercise_id, w.created_at, e.name
    `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<RecentSetsForExerciseModel>(
        query,
        params,
      );
      return queryResult;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  /**
   * Gets the number of times each exercise has been used
   *
   * @param {string} userId
   * @returns {NumTimesUsedForExerciseModel[]}
   */
  public async getNumTimesEachExerciseUsed(
    userId: string,
  ): Promise<NumTimesUsedForExerciseModel[]> {
    const queryName = 'GetNumTimesEachExerciseUsed';

    const query = `
      SELECT
        we.exercise_id as id,
        COUNT(we.exercise_id) as num_times_used,
        e.name
	    FROM workout_exercise as we
	    INNER JOIN workout w on w.id = we.workout_id
      INNER JOIN exercise e on e.id = we.exercise_id
	    WHERE w.user_id = $1
	    GROUP BY we.exercise_id, e.name
    `;
    const params = [userId];

    try {
      const { queryResult } =
        await this.db.queryV2<NumTimesUsedForExerciseModel>(query, params);

      return queryResult;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }
}
