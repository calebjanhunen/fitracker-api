import { Injectable } from '@nestjs/common';
import { ExerciseVariationModel } from '../models';
import { ExerciseVariationRepository } from '../repository/exercise-variation.repository';

@Injectable()
export class ExerciseVariationService {
  constructor(
    private readonly exerciseVariationRepo: ExerciseVariationRepository,
  ) {}

  public async getExerciseVariationsByIds(
    exerciseVariationIds: string[],
    userId: string,
  ): Promise<ExerciseVariationModel[]> {
    return this.exerciseVariationRepo.getExerciseVariationsByIds(
      exerciseVariationIds,
      userId,
    );
  }
}
