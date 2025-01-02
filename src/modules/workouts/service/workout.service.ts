import { Injectable } from '@nestjs/common';
import { InvalidOrderException } from 'src/common/internal-exceptions/invalid-order.exception';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { XpCannotBeBelowZeroException } from 'src/modules/user/internal-exceptions/xp-cannot-be-below-zero.exceptions';
import { UserService } from 'src/modules/user/service/user.service';
import { WorkoutEffortXpCalculator } from '../calculator/workout-effort-xp.calculator';
import { DeleteWorkout } from '../interfaces/delete-workout.interface';
import { CouldNotDeleteWorkoutException } from '../internal-errors/could-not-delete-workout.exception';
import { CouldNotSaveWorkoutException } from '../internal-errors/could-not-save-workout.exception';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';
import { InsertWorkoutModel, WorkoutModel } from '../models';
import { CreateWorkout } from '../models/create-workout';
import { WorkoutRepository } from '../repository/workout.repository';

interface ICalculateWorkoutXp {
  totalWorkoutXp: number;
  workoutEffortXp: number;
}

@Injectable()
export class WorkoutService {
  constructor(
    private exerciseService: ExerciseService,
    private workoutRepo: WorkoutRepository,
    private readonly userService: UserService,
    private readonly workoutEffortXpCalculator: WorkoutEffortXpCalculator,
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
  ): Promise<CreateWorkout> {
    const exerciseIds = workout.exercises.map((e) => e.exerciseId);
    await this.exerciseService.validateExercisesExist(exerciseIds, userId);
    this.validateOrderForExercisesAndSets(workout);

    const userStats = await this.userService.getStatsByUserId(userId);
    const userProfile = await this.userService.getCurrentUser(userId);

    const hasWeeklyGoalBeenReachedForFirstTime =
      await this.hasWeeklyWorkoutGoalBeenReachedForFirstTime(
        userStats.weeklyWorkoutGoalAchievedAt,
        workout.createdAt,
        userProfile.weeklyWorkoutGoal,
        userId,
      );
    if (hasWeeklyGoalBeenReachedForFirstTime) {
      userStats.weeklyWorkoutGoalAchievedAt = workout.createdAt;
    }

    const { totalWorkoutXp, workoutEffortXp } = this.calculateWorkoutXp(
      workout,
      userId,
    );
    workout.gainedXp = totalWorkoutXp;

    try {
      const createdWorkout = await this.workoutRepo.create(workout, userId);

      userStats.totalXp += totalWorkoutXp;
      await this.userService.updateUserStats(userId, userStats);

      return {
        workout: createdWorkout,
        workoutStats: {
          totalWorkoutXp,
          workoutEffortXp,
        },
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
  public async delete(
    workoutId: string,
    userId: string,
  ): Promise<DeleteWorkout> {
    const workoutToBeDeleted = await this.findById(workoutId, userId);
    const userStats = await this.userService.getStatsByUserId(userId);

    if (userStats.totalXp - workoutToBeDeleted.gainedXp < 0) {
      throw new XpCannotBeBelowZeroException();
    }

    try {
      await this.workoutRepo.delete(workoutId, userId);

      userStats.totalXp -= workoutToBeDeleted.gainedXp;
      const updatedUserStats = await this.userService.updateUserStats(
        userId,
        userStats,
      );
      return {
        totalUserXp: updatedUserStats.totalXp,
      };
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

  /**
   * Returns the total xp gained from a created workout.
   * @param {InsertWorkoutModel} workout
   * @returns {ICalculateWorkoutXp}
   */
  private calculateWorkoutXp(
    workout: InsertWorkoutModel,
    userId: string,
  ): ICalculateWorkoutXp {
    const workoutEffortXp =
      this.workoutEffortXpCalculator.calculateWorkoutEffortXp(workout, userId);
    const totalWorkoutXp = workoutEffortXp;

    return { totalWorkoutXp, workoutEffortXp };
  }

  private async hasWeeklyWorkoutGoalBeenReachedForFirstTime(
    weeklyWorkoutGoalAchievedAt: Date | null,
    workoutCreatedAt: Date,
    weeklyWorkoutGoal: number,
    userId: string,
  ): Promise<boolean> {
    if (weeklyWorkoutGoalAchievedAt?.isInSameWeekAs(workoutCreatedAt)) {
      return false;
    }

    const completedWorkoutsToday = await this.workoutRepo.getWorkoutsByDate(
      workoutCreatedAt,
      userId,
    );
    if (completedWorkoutsToday.length > 0) {
      return false;
    }

    const numberOfDaysWithWorkoutsThisWeek =
      await this.workoutRepo.getNumberOfDaysWhereAWorkoutWasCompletedThisWeek(
        userId,
        workoutCreatedAt,
      );
    if (numberOfDaysWithWorkoutsThisWeek + 1 === weeklyWorkoutGoal) {
      return true;
    }

    return false;
  }
}
