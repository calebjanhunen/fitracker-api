import { DbService } from 'src/common/database';
import { LoggerService } from 'src/common/logger/logger.service';
import { ExerciseVariationModel } from '../models';
import { DatabaseException } from 'src/common/internal-exceptions';

export class ExerciseVariationRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ExerciseVariationRepository.name);
  }

  public async getExercisesByIds(
    exerciseVariationIds: string[],
    userId: string,
  ): Promise<ExerciseVariationModel[]> {
    const queryName = 'getExercisesByIds';
    const query = `
        SELECT
            ev.id,
            ev.exercise_id,
            ev.user_id,
            ev.name,
            ev.notes,
            ca.name
        FROM public.exercise_variation ev
        LEFT JOIN public.cable_attachment ca.id = ev.cable_attachment_id
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
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }
}
