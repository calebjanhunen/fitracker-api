import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { LoggerService } from 'src/common/logger/logger.service';
import { BaseRepository } from 'src/common/repository';
import {
  CreateExerciseVariationModel,
  ExerciseModel,
  ExerciseVariationModel,
  ExerciseWorkoutHistoryModel,
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
    const queryName = 'getExerciseVariationDetails';
    const query = `
      SELECT
        ev.id,
        ev.name,
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
}
