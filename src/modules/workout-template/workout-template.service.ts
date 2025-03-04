import { Injectable } from '@nestjs/common';
import { InvalidOrderException } from 'src/common/internal-exceptions/invalid-order.exception';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { ExerciseVariationService } from '../exercises/services';
import { ExerciseService } from '../exercises/services/exercise.service';
import {
  InsertWorkoutTemplateExerciseModel,
  InsertWorkoutTemplateModel,
  WorkoutTemplateModel,
} from './models';
import { WorkoutTemplateRepository } from './workout-template.repository';

@Injectable()
export class WorkoutTemplateService {
  constructor(
    private workoutTemplateRepo: WorkoutTemplateRepository,
    private exerciseService: ExerciseService,
    private exerciseVariationService: ExerciseVariationService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(WorkoutTemplateService.name);
  }

  public async createWorkoutTemplate(
    workoutTemplate: InsertWorkoutTemplateModel,
    userId: string,
  ): Promise<WorkoutTemplateModel> {
    await this.validateExercisesExist(workoutTemplate.exercises, userId);
    this.validateOrderForExercisesAndSets(workoutTemplate);

    try {
      const createdWorkoutTemplate =
        await this.workoutTemplateRepo.createWorkoutTemplate(
          workoutTemplate,
          userId,
        );
      return createdWorkoutTemplate;
    } catch (e) {
      throw e;
    }
  }

  public async findAllWorkoutTemplates(
    userId: string,
  ): Promise<WorkoutTemplateModel[]> {
    return this.workoutTemplateRepo.findAllWorkoutTemplates(userId);
  }

  public async deleteWorkoutTemplate(
    workoutTemplateId: string,
    userId: string,
  ): Promise<void> {
    const existingWorkoutTemplate =
      await this.workoutTemplateRepo.findWorkoutTemplateById(
        workoutTemplateId,
        userId,
      );

    if (!existingWorkoutTemplate) {
      this.logger.warn(
        `User ${userId} tried to delete workout template ${workoutTemplateId}`,
      );
      throw new ResourceNotFoundException(
        `Workout Template ${workoutTemplateId} does not exist`,
      );
    }

    await this.workoutTemplateRepo.deleteWorkoutTemplate(
      workoutTemplateId,
      userId,
    );
  }

  private async validateExercisesExist(
    exercises: InsertWorkoutTemplateExerciseModel[],
    userId: string,
  ): Promise<void> {
    const exerciseIds = [];
    const exerciseVariationIds = [];
    for (const exercise of exercises) {
      if (exercise.isVariation) {
        exerciseVariationIds.push(exercise.exerciseId);
      } else {
        exerciseIds.push(exercise.exerciseId);
      }
    }
    await this.exerciseService.validateExercisesExist(exerciseIds, userId);

    const exerciseVariations =
      await this.exerciseVariationService.getExerciseVariationsByIds(
        exerciseVariationIds,
        userId,
      );
    if (exerciseVariations.length !== exerciseVariationIds.length) {
      throw new ResourceNotFoundException(
        'One or more exercise variations do not exist',
      );
    }
  }

  /**
   * Loops through exercises and sets and validates that the order for each increase sequentially.
   * @param {InsertWorkoutTemplateModel} workoutTemplate
   *
   * @throws {InvalidOrderException}
   */
  private validateOrderForExercisesAndSets(
    workoutTemplate: InsertWorkoutTemplateModel,
  ): void {
    for (let i = 0; i < workoutTemplate.exercises.length; i++) {
      if (workoutTemplate.exercises[i].order !== i + 1) {
        throw new InvalidOrderException('exercise');
      }
      for (let j = 0; j < workoutTemplate.exercises[i].sets.length; j++) {
        const set = workoutTemplate.exercises[i].sets[j];
        if (set.order !== j + 1) {
          throw new InvalidOrderException('set');
        }
      }
    }
  }
}
