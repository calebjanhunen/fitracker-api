import { InvalidOrderException } from 'src/common/internal-exceptions';
import { ExerciseService } from 'src/modules/exercises/services';
import { InsertWorkoutExerciseModel, InsertWorkoutModel } from '../models';

export abstract class BaseWorkoutService {
  constructor(private readonly exerciseService: ExerciseService) {}

  protected async validateExercisesExist(
    exercises: InsertWorkoutExerciseModel[],
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
  }

  /**
   * Loops through exercises and sets and validates that the order for each increase sequentially.
   * @param {InsertWorkoutModel} workout
   *
   * @throws {InvalidOrderException}
   */
  protected validateOrderForExercisesAndSets(
    workout: InsertWorkoutModel,
  ): void {
    for (let i = 0; i < workout.exercises.length; i++) {
      if (workout.exercises[i].order !== i + 1) {
        throw new InvalidOrderException('exercise');
      }
      for (let j = 0; j < workout.exercises[i].sets.length; j++) {
        const set = workout.exercises[i].sets[j];
        if (set.order !== j + 1) {
          throw new InvalidOrderException('set');
        }
      }
    }
  }
}
