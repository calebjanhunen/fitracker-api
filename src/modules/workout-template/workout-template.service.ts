import { Injectable } from '@nestjs/common';
import { InvalidOrderException } from 'src/common/internal-exceptions/invalid-order.exception';
import { ExerciseService } from '../exercises/services/exercise.service';
import { InsertWorkoutTemplateModel, WorkoutTemplateModel } from './models';
import { WorkoutTemplateRepository } from './workout-template.repository';

@Injectable()
export class WorkoutTemplateService {
  constructor(
    private workoutTemplateRepo: WorkoutTemplateRepository,
    private exerciseService: ExerciseService,
  ) {}

  public async createWorkoutTemplate(
    workoutTemplate: InsertWorkoutTemplateModel,
    userId: string,
  ): Promise<WorkoutTemplateModel> {
    const exerciseIds = workoutTemplate.exercises.map((e) => e.exerciseId);
    await this.exerciseService.validateExercisesExist(exerciseIds, userId);
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
