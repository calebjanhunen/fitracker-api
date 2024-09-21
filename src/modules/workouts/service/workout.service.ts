import { Injectable } from '@nestjs/common';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { UserService } from 'src/modules/user/service/user.service';
import { ICreateWorkout } from '../interfaces/create-workout.interface';
import { CouldNotDeleteWorkoutException } from '../internal-errors/could-not-delete-workout.exception';
import { CouldNotSaveWorkoutException } from '../internal-errors/could-not-save-workout.exception';
import { InvalidOrderException } from '../internal-errors/invalid-order.exception';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';
import { InsertWorkoutModel, WorkoutModel } from '../models';
import { WorkoutRepository } from '../repository/workout.repository';

@Injectable()
export class WorkoutService {
  private readonly WORKOUT_COMPLETION_XP = 10;

  constructor(
    private exerciseService: ExerciseService,
    private workoutRepo: WorkoutRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a workout.
   * @param {InsertWorkoutModel} workout
   * @param {string} userId
   * @returns {WorkoutResponseDto} Created Workout
   *
   * @throws {ResourceNotFoundException}
   * @throws {InvalidOrderException}
   * @throws {CouldNotSaveWorkoutException}
   */
  public async create(
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<ICreateWorkout> {
    const exerciseIds = workout.exercises.map((e) => e.exerciseId);
    await this.exerciseService.validateExercisesExist(exerciseIds, userId);
    this.validateOrderForExercisesAndSets(workout);

    try {
      const createdWorkout = await this.workoutRepo.create(workout, userId);
      const totalXp = await this.userService.incrementTotalXp(
        this.WORKOUT_COMPLETION_XP,
        userId,
      );
      return {
        workoutId: createdWorkout.id,
        xpGained: this.WORKOUT_COMPLETION_XP,
        totalXp,
      };
    } catch (e) {
      throw new CouldNotSaveWorkoutException(workout.name);
    }
  }

  /**
   * Finds a workout by its id.
   * @param {string} workoutId The id of the workout.
   * @param {string} userId    The id of the user.
   * @return {Workout}
   *
   * @throws {WorkoutNotFoundException}
   */
  public async findById(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutModel> {
    const workout = await this.workoutRepo.findById(workoutId, userId);

    if (!workout) throw new WorkoutNotFoundException();

    return workout;
  }

  /**
   * Finds all workouts for a user.
   * @param {string} userId
   * @returns {WorkoutModel[]}
   */
  public async findAll(userId: string): Promise<WorkoutModel[]> {
    return this.workoutRepo.findAll(userId);
  }

  /**
   * Deletes a workout.
   *
   * @param {string} workoutId
   * @param {string} userId
   *
   * @throws {CouldNotDeleteWorkoutException}
   * @throws {WorkoutNotFoundException}
   * @throws {XpCannotBeBelowZeroException}
   */
  public async delete(workoutId: string, userId: string): Promise<void> {
    await this.findById(workoutId, userId);
    await this.userService.decrementTotalXp(this.WORKOUT_COMPLETION_XP, userId);

    try {
      await this.workoutRepo.delete(workoutId, userId);
    } catch (e) {
      throw new CouldNotDeleteWorkoutException(e.message);
    }
  }

  public async update(
    workoutId: string,
    userId: string,
    workout: InsertWorkoutModel,
  ): Promise<WorkoutModel> {
    await this.findById(workoutId, userId);

    const exerciseIds = workout.exercises.map((e) => e.exerciseId);
    await this.exerciseService.validateExercisesExist(exerciseIds, userId);
    this.validateOrderForExercisesAndSets(workout);

    return await this.workoutRepo.update(workoutId, workout, userId);
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
}
