import { Injectable } from '@nestjs/common';
import { InvalidOrderException } from 'src/common/internal-exceptions/invalid-order.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { XpCannotBeBelowZeroException } from 'src/modules/user/internal-exceptions/xp-cannot-be-below-zero.exceptions';
import { UserStats } from 'src/modules/user/models/user-stats.model';
import { UserService } from 'src/modules/user/service/user.service';
import {
  LevelCalculator,
  WorkoutEffortXpCalculator,
  WorkoutGoalXpCalculator,
} from '../calculator';
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
  workoutGoalXp: number;
  workoutGoalStreakXp: number;
}

@Injectable()
export class WorkoutService {
  constructor(
    private exerciseService: ExerciseService,
    private workoutRepo: WorkoutRepository,
    private readonly userService: UserService,
    private readonly workoutEffortXpCalculator: WorkoutEffortXpCalculator,
    private readonly workoutGoalXpCalculator: WorkoutGoalXpCalculator,
    private readonly levelCalculator: LevelCalculator,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(WorkoutService.name);
  }

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

    const daysWithWorkoutsThisWeekIncludingCurrentWorkout =
      (await this.workoutRepo.getNumberOfDaysWhereAWorkoutWasCompletedThisWeek(
        userId,
        workout.createdAt,
      )) + 1;
    const hasWorkoutGoalBeenReachedOrExceeded =
      await this.hasWorkoutGoalBeenReachedOrExceeded(
        userStats.weeklyWorkoutGoalAchievedAt,
        workout.createdAt,
        userProfile.weeklyWorkoutGoal,
        userId,
        daysWithWorkoutsThisWeekIncludingCurrentWorkout,
      );
    if (
      hasWorkoutGoalBeenReachedOrExceeded &&
      daysWithWorkoutsThisWeekIncludingCurrentWorkout ===
        userProfile.weeklyWorkoutGoal
    ) {
      userStats.weeklyWorkoutGoalAchievedAt = workout.createdAt;

      if (
        daysWithWorkoutsThisWeekIncludingCurrentWorkout ===
        userProfile.weeklyWorkoutGoal
      ) {
        userStats.weeklyWorkoutGoalStreak++;
      }
    }

    const {
      totalWorkoutXp,
      workoutEffortXp,
      workoutGoalXp,
      workoutGoalStreakXp,
    } = this.calculateWorkoutXp(
      workout,
      userId,
      hasWorkoutGoalBeenReachedOrExceeded,
      userProfile.weeklyWorkoutGoal,
      userStats.weeklyWorkoutGoalStreak,
      daysWithWorkoutsThisWeekIncludingCurrentWorkout,
    );
    workout.gainedXp = totalWorkoutXp;

    const { newLevel, newCurrentXp } =
      this.levelCalculator.calculateNewLevelAndCurrentXp(
        userStats.level,
        userStats.currentXp,
        totalWorkoutXp,
      );
    this.logger.log(
      `Old level: ${userStats.level}, new level: ${newLevel}. Old current xp: ${userStats.currentXp}, new current xp: ${newCurrentXp} for user ${userId}`,
      {
        oldLevel: userStats.level,
        newLevel,
        oldCurrentXp: userStats.currentXp,
        newCurrentXp,
        userId,
      },
    );

    try {
      const createdWorkout = await this.workoutRepo.create(workout, userId);

      const newUserStats = new UserStats();
      newUserStats.totalXp = newCurrentXp;
      newUserStats.level = newLevel;
      newUserStats.currentXp = newCurrentXp;
      newUserStats.totalXp = userStats.totalXp + totalWorkoutXp;
      await this.userService.updateUserStats(userId, newUserStats);

      return {
        workout: createdWorkout,
        workoutStats: {
          totalWorkoutXp,
          workoutEffortXp,
          workoutGoalXp,
          workoutGoalStreakXp,
        },
        userStatsBeforeWorkout: {
          level: userStats.level,
          currentXp: userStats.currentXp,
        },
        userStatsAfterWorkout: {
          level: newLevel,
          currentXp: newCurrentXp,
          xpNeededForCurrentLevel:
            this.levelCalculator.getXpNeededForCurrentLevel(newLevel),
          daysWithWorkoutsThisWeek:
            daysWithWorkoutsThisWeekIncludingCurrentWorkout,
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
    hasWorkoutGoalBeenReachedOrExceeded: boolean,
    userWorkoutGoal: number,
    workoutGoalStreak: number,
    daysWithWorkoutsThisWeek: number,
  ): ICalculateWorkoutXp {
    const workoutEffortXp =
      this.workoutEffortXpCalculator.calculateWorkoutEffortXp(workout, userId);

    let workoutGoalXp = 0;
    let workoutGoalStreakXp = 0;
    if (hasWorkoutGoalBeenReachedOrExceeded) {
      workoutGoalXp = this.workoutGoalXpCalculator.calculateWorkoutGoalXp(
        userWorkoutGoal,
        daysWithWorkoutsThisWeek,
      );

      if (daysWithWorkoutsThisWeek === userWorkoutGoal) {
        workoutGoalStreakXp =
          this.workoutGoalXpCalculator.calculateWorkoutGoalStreakXp(
            workoutGoalStreak,
            userWorkoutGoal,
          );
      }
    }

    this.logger.log(
      `Workout XP calculated for user ${userId} and workout ${workout.name}. Workout effort XP = ${workoutEffortXp}, workout goal xp = ${workoutGoalXp}, workout goal streak xp = ${workoutGoalStreakXp}`,
      { userId, workoutEffortXp, workoutGoalXp, workoutGoalStreakXp },
    );

    const totalWorkoutXp =
      workoutEffortXp + workoutGoalXp + workoutGoalStreakXp;
    this.logger.log(`Total workout xp for user ${userId} = ${totalWorkoutXp}`, {
      userId,
      totalWorkoutXp,
    });
    return {
      totalWorkoutXp,
      workoutEffortXp,
      workoutGoalXp,
      workoutGoalStreakXp,
    };
  }

  private async hasWorkoutGoalBeenReachedOrExceeded(
    weeklyWorkoutGoalAchievedAt: Date | null,
    workoutCreatedAt: Date,
    weeklyWorkoutGoal: number,
    userId: string,
    daysWithWorkoutsThisWeek: number,
  ): Promise<boolean> {
    if (
      weeklyWorkoutGoalAchievedAt?.isInSameWeekAs(workoutCreatedAt) &&
      daysWithWorkoutsThisWeek <= weeklyWorkoutGoal
    ) {
      return false;
    }

    const completedWorkoutsToday = await this.workoutRepo.getWorkoutsByDate(
      workoutCreatedAt,
      userId,
    );
    if (completedWorkoutsToday.length > 0) {
      // a workout has already been completed today
      return false;
    }

    if (daysWithWorkoutsThisWeek >= weeklyWorkoutGoal) {
      // number of days a workout has been completed including the currently completed workout is equal or greater than the goal
      return true;
    }

    return false;
  }
}
