import { Injectable } from '@nestjs/common';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { CouldNotSaveWorkoutException } from '../internal-errors/could-not-save-workout.exception';
import { InvalidOrderException } from '../internal-errors/invalid-order.exception';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';
import { InsertWorkoutModel, WorkoutModel } from '../models';
import { WorkoutRepository } from '../repository/workout.repository';

@Injectable()
export class WorkoutService {
  constructor(
    private exerciseService: ExerciseService,
    private workoutRepo: WorkoutRepository,
  ) {}

  /**
   * Gets a workout by its id.
   * @param {string} workoutId The id of the workout.
   * @param {string} userId    The id of the user.
   * @return {Workout}
   *
   * @throws {WorkoutNotFoundException}
   */
  async findById(workoutId: string, userId: string): Promise<WorkoutModel> {
    const workout = await this.workoutRepo.findById(workoutId, userId);

    if (!workout) throw new WorkoutNotFoundException();

    return workout;
  }

  /**
   * Validates exercises exist, maps workout dto to entity
   * and saves the workout
   * @param {InsertWorkoutModel} workout
   * @param {string} userId
   * @returns {WorkoutResponseDto} Created Workout
   *
   * @throws {ResourceNotFoundException}
   * @throws {InvalidOrderException}
   * @throws {CouldNotSaveWorkoutException}
   */
  async create(
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<WorkoutModel> {
    const exerciseIds = workout.exercises.map((e) => e.exerciseId);
    await this.exerciseService.validateExercisesExist(exerciseIds, userId);
    this.validateOrderForExercisesAndSets(workout);

    try {
      const createdWorkout = await this.workoutRepo.create(workout, userId);
      return createdWorkout;
    } catch (e) {
      throw new CouldNotSaveWorkoutException(workout.name);
    }
  }

  /**
   * Loops through exercises and sets and validates that the order for each increase sequentially.
   * @param {InsertWorkoutModel} workout
   *
   * @throws {InvalidOrderException}
   */
  private validateOrderForExercisesAndSets(workout: InsertWorkoutModel): void {
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

  // /**
  //  * Gets all workouts for a given user
  //  * @param {string} userId
  //  * @returns {Workout[]}
  //  */
  // async getWorkouts(userId: string): Promise<Workout[]> {
  //   await this.userService.getById(userId);

  //   const workouts = await this.workoutRepo.getMany(userId);

  //   return workouts;
  // }

  // /**
  //  * Deletes a workout given its id
  //  *
  //  * @param {string} workoutId
  //  * @param {string} userId
  //  *
  //  * @throws {CouldNotDeleteWorkoutException}
  //  * @throws {WorkoutNotFoundException}
  //  */
  // async deleteWorkout(workoutId: string, userId: string): Promise<void> {
  //   await this.userService.getById(userId);

  //   const workoutToDelete = await this.getById(workoutId, userId);

  //   try {
  //     await this.workoutRepo.delete(workoutToDelete);
  //   } catch (e) {
  //     throw new CouldNotDeleteWorkoutException();
  //   }
  // }
}
