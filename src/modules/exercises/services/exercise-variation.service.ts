import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/internal-exceptions';
import {
  CreateExerciseVariationModel,
  ExerciseVariationModel,
} from '../models';
import {
  CableAttachmentRepository,
  ExerciseVariationRepository,
} from '../repository';
import { ExerciseService } from './exercise.service';

@Injectable()
export class ExerciseVariationService {
  constructor(
    private readonly exerciseVariationRepo: ExerciseVariationRepository,
    private readonly cableAttachmentRepo: CableAttachmentRepository,
    private readonly exerciseService: ExerciseService,
  ) {}

  public async createExerciseVariation(
    exerciseId: string,
    userId: string,
    model: CreateExerciseVariationModel,
  ) {
    await this.exerciseService.ensureExerciseExists(exerciseId, userId);

    if (model.cableAttachmentId) {
      const cableAttachment = await this.cableAttachmentRepo.getAttachmentById(
        model.cableAttachmentId,
      );

      if (!cableAttachment) {
        throw new ResourceNotFoundException('Cable attachment does not exist');
      }
    }

    const exerciseVariationId =
      await this.exerciseVariationRepo.createExerciseVariation(
        exerciseId,
        userId,
        model,
      );

    return await this.exerciseVariationRepo.getExerciseVariationById(
      exerciseVariationId,
      userId,
    )!;
  }

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
