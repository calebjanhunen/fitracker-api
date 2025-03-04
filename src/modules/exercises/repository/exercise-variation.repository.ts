import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { LoggerService } from 'src/common/logger/logger.service';
import { BaseRepository } from 'src/common/repository';
import {
  CreateExerciseVariationModel,
  ExerciseModel,
  ExerciseVariationModel,
  ExerciseWorkoutHistoryModel,
  NumTimesUsedForExerciseModel,
  RecentSetsForExerciseModel,
  UpdateExerciseVariationModel,
} from '../models';

@Injectable()
export class ExerciseVariationRepository extends BaseRepository {
  private readonly COLUMNS_AND_JOINS = `
      ev.id,
      ev.name,
      ev.notes,
      ca.name as cable_attachment
    FROM public.exercise_variation ev
    LEFT JOIN public.cable_attachment ca ON ca.id = ev.cable_attachment_id
  `;

  constructor(
    private readonly db: DbService,
    logger: LoggerService,
  ) {
    super(logger, ExerciseVariationRepository.name);
  }

  public async createExerciseVariation(
    exerciseId: string,
    userId: string,
    model: CreateExerciseVariationModel,
  ): Promise<string> {
    const queryName = 'createExerciseVariation';
    const query = `
      INSERT INTO public.exercise_variation
        (exercise_id, user_id, name, notes, cable_attachment_id)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const params = [
      exerciseId,
      userId,
      model.name,
      model.notes,
      model.cableAttachmentId,
    ];

    try {
      const { queryResult } = await this.db.queryV2<{ id: string }>(
        query,
        params,
      );

      return queryResult[0].id;
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  public async getExerciseVariations(userId: string): Promise<ExerciseModel[]> {
    const queryName = 'getExerciseVariationsForExerciseList';
    const query = `
      SELECT
        ev.id,
        ev.name,
        bp.name as body_part,
        eq.name as equipment,
        true as is_custom,
        e.id as parent_exercise_id
      FROM public.exercise_variation ev
      INNER JOIN exercise e ON e.id = ev.exercise_id
      INNER JOIN body_part bp ON bp.id = e.body_part_id
      INNER JOIN equipment eq ON eq.id = e.equipment_id
      WHERE ev.user_id = $1
    `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseModel>(
        query,
        params,
      );

      return queryResult;
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  public async getExerciseVariationByIdV2(
    exerciseVariationId: string,
    userId: string,
  ): Promise<ExerciseModel | null> {
    const queryName = 'getExerciseVariationByIdV2';
    const query = `
      SELECT
        ev.id,
        ev.name,
        ev.notes,
        bp.name as body_part,
        eq.name as equipment,
        true as is_custom,
        e.id as parent_exercise_id,
        e.name as parent_exercise_name
      FROM public.exercise_variation ev
      INNER JOIN exercise e ON e.id = ev.exercise_id
      INNER JOIN body_part bp ON bp.id = e.body_part_id
      INNER JOIN equipment eq ON eq.id = e.equipment_id
      WHERE ev.id = $1 AND
        ev.user_id = $2
    `;
    const params = [exerciseVariationId, userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseModel>(
        query,
        params,
      );

      if (!queryResult.length) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  public async getExerciseVariationWorkoutHistory(
    exerciseVariationId: string,
    userId: string,
  ): Promise<ExerciseWorkoutHistoryModel[]> {
    const queryName = 'getExerciseVariationWorkoutHistory';
    const query = `
          SELECT
            w.id,
            w.name,
            w.created_at,
            w.duration,
            json_agg(
              json_build_object(
                'id', ws.id,
                'reps', ws.reps,
                'weight', ws.weight,
                'rpe', ws.rpe
              )
            ORDER BY ws.order) as sets
          FROM workout as w
          LEFT JOIN workout_exercise we
            ON we.workout_id = w.id
          LEFT JOIN workout_set ws
            ON ws.workout_exercise_id = we.id
          LEFT JOIN exercise_variation ev
            ON ev.id = we.exercise_variation_id
          WHERE ev.id = $1 AND
            w.user_id = $2
          GROUP BY w.id, w.name, w.created_at
          ORDER BY w.created_at DESC
        `;
    const params = [exerciseVariationId, userId];

    try {
      const { queryResult } =
        await this.db.queryV2<ExerciseWorkoutHistoryModel>(query, params);

      return queryResult;
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  public async getExerciseVariationById(
    id: string,
    userId: string,
  ): Promise<ExerciseVariationModel | null> {
    const queryName = 'getExerciseVariationById';
    const query = `
        SELECT
            ${this.COLUMNS_AND_JOINS}
        WHERE ev.id = $1 AND
            ev.user_id = $2;
    `;
    const params = [id, userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseVariationModel>(
        query,
        params,
      );

      if (!queryResult.length) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  public async getExerciseVariationsByIds(
    exerciseVariationIds: string[],
    userId: string,
  ): Promise<ExerciseVariationModel[]> {
    const queryName = 'getExerciseVariationsByIds';
    const query = `
        SELECT
            ${this.COLUMNS_AND_JOINS}
        WHERE ev.id = ANY($1) AND
            ev.user_id = $2;
    `;
    const params = [exerciseVariationIds, userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseVariationModel>(
        query,
        params,
      );
      return queryResult;
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  public async getExerciseVariationsByExerciseId(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseVariationModel[]> {
    const queryName = 'getExerciseVariationsByExerciseId';
    const query = `
        SELECT
            ${this.COLUMNS_AND_JOINS}
        WHERE ev.exercise_id = $1 AND
            ev.user_id = $2;
    `;
    const params = [exerciseId, userId];

    try {
      const { queryResult } = await this.db.queryV2<ExerciseVariationModel>(
        query,
        params,
      );
      return queryResult;
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  public async updateExerciseVariation(
    exerciseVariationId: string,
    exerciseVariation: UpdateExerciseVariationModel,
    userId: string,
  ): Promise<void> {
    const queryName = 'updateExerciseVariation';
    const query = `
      UPDATE public.exercise_variation
      SET
        name = $1,
        notes = $2
      WHERE id = $3 AND
        user_id = $4;
    `;
    const params = [
      exerciseVariation.name,
      exerciseVariation.notes,
      exerciseVariationId,
      userId,
    ];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  /**
   * Gets the sets from the most recent workout that each exercise was used
   *
   * @param {string} userId
   * @returns {RecentSetsForExerciseModel[]}
   */
  public async getMostRecentWorkoutSetsForAllVariations(
    userId: string,
  ): Promise<RecentSetsForExerciseModel[]> {
    const queryName = 'getMostRecentWorkoutSetsForAllVariations';

    const query = `
        WITH recent_workouts AS (
          SELECT
            we.exercise_variation_id,
            MAX(w.created_at) as most_recent_date
          FROM workout as w
          INNER JOIN workout_exercise we ON we.workout_id = w.id
          WHERE w.user_id = $1 AND
          	we.exercise_variation_id is not NULL
          GROUP BY we.exercise_variation_id
        )
  
        SELECT
          we.exercise_variation_id as id,
          json_agg(json_build_object(
            'id', ws.id,
            'weight', ws.weight,
            'reps', ws.reps,
            'rpe', ws.rpe
          ) ORDER BY ws.order) as recent_sets
          FROM workout_exercise as we
          INNER JOIN workout w ON w.id = we.workout_id
          INNER JOIN workout_set ws ON we.id = ws.workout_exercise_id
          INNER JOIN recent_workouts rw ON rw.exercise_variation_id = we.exercise_variation_id AND rw.most_recent_date = w.created_at
          INNER JOIN exercise_variation ev ON ev.id = we.exercise_variation_id
          WHERE w.user_id = $1
          GROUP BY we.exercise_variation_id, w.created_at, ev.name
      `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<RecentSetsForExerciseModel>(
        query,
        params,
      );
      return queryResult;
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }

  /**
   * Gets the number of times each exercise has been used
   *
   * @param {string} userId
   * @returns {NumTimesUsedForExerciseModel[]}
   */
  public async getNumTimesEachVariationUsed(
    userId: string,
  ): Promise<NumTimesUsedForExerciseModel[]> {
    const queryName = 'getNumTimesEachVariationUsed';

    const query = `
        SELECT
          we.exercise_variation_id as id,
          COUNT(we.exercise_variation_id) as num_times_used
        FROM workout_exercise as we
        INNER JOIN workout w on w.id = we.workout_id
        INNER JOIN exercise_variation ev on ev.id = we.exercise_variation_id
        WHERE w.user_id = $1
        GROUP BY we.exercise_variation_id, ev.name
      `;
    const params = [userId];

    try {
      const { queryResult } =
        await this.db.queryV2<NumTimesUsedForExerciseModel>(query, params);

      return queryResult;
    } catch (e) {
      throw this.handleError(e, queryName);
    }
  }
}
