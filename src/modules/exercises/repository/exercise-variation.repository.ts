import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { LoggerService } from 'src/common/logger/logger.service';
import { BaseRepository } from 'src/common/repository';
import {
  CreateExerciseVariationModel,
  ExerciseVariationModel,
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
            ev.id,
            ev.name,
            ev.notes,
            ca.name
        FROM public.exercise_variation ev
        LEFT JOIN public.cable_attachment ca ON ca.id = ev.cable_attachment_id
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
}
