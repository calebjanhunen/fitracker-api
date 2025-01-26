import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';
import {
  ExerciseService,
  ExerciseVariationService,
} from 'src/modules/exercises/services';
import { UserStats } from 'src/modules/user/models';
import { UserService } from 'src/modules/user/service';
import {
  LevelCalculator,
  WorkoutEffortXpCalculator,
  WorkoutGoalXpCalculator,
} from '../calculator';
import { ICalculateWorkoutXp } from '../interfaces';
import { CouldNotSaveWorkoutException } from '../internal-errors';
import { CreateWorkout, InsertWorkoutModel } from '../models';
import { WorkoutRepository } from '../repository';
import { BaseWorkoutService } from './base-workout.service';

@Injectable()
export class CreateWorkoutService extends BaseWorkoutService {
  constructor(
    private readonly workoutRepo: WorkoutRepository,
    private readonly userService: UserService,
    private readonly workoutEffortXpCalculator: WorkoutEffortXpCalculator,
    private readonly workoutGoalXpCalculator: WorkoutGoalXpCalculator,
    private readonly levelCalculator: LevelCalculator,
    private readonly logger: LoggerService,
    exerciseService: ExerciseService,
    exerciseVariationService: ExerciseVariationService,
  ) {
    super(exerciseService, exerciseVariationService);
    this.logger.setContext(CreateWorkoutService.name);
  }

  public async createWorkout(
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<CreateWorkout> {
    await this.validateExercisesExist(workout.exercises, userId);
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
