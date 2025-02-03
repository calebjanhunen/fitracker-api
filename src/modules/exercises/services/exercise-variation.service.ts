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
  CABLE = 'cable';
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
    const exercise = await this.exerciseService.findById(exerciseId, userId);
    if (!exercise) {
      throw new ResourceNotFoundException('Exercise not found');
    }

    if (exercise.equipment !== this.CABLE && model.cableAttachmentId) {
      throw new Error(
        'Exercise must use the cable in order for the variation to have a cable attachment',
      );
    }

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
