import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';
import {
  ExerciseService,
  ExerciseVariationService,
} from 'src/modules/exercises/services';
import { UserProfileModel, UserStats } from 'src/modules/user/models';
import { UserService } from 'src/modules/user/service';
import {
  LevelCalculator,
  WorkoutEffortXpCalculator,
  WorkoutGoalXpCalculator,
} from '../calculator';
import { ICalculateWorkoutXp } from '../interfaces';
import { CouldNotSaveWorkoutException } from '../internal-errors';
import { CreateWorkout, InsertWorkoutModel, WorkoutModel } from '../models';
import { CreateWorkoutRepository, WorkoutRepository } from '../repository';
import { BaseWorkoutService } from './base-workout.service';
import { GetWorkoutService } from './get-workout.service';

@Injectable()
export class CreateWorkoutService extends BaseWorkoutService {
  constructor(
    private readonly workoutRepo: WorkoutRepository,
    private readonly createWorkoutRepo: CreateWorkoutRepository,
    private readonly getWorkoutService: GetWorkoutService,
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

    // Get days with workouts this week including the currently created workout
    const daysWithWorkoutsThisWeek =
      (await this.workoutRepo.getDaysWithWorkoutsThisWeek(
        userId,
        workout.createdAt,
      )) + 1;

    const hasWorkoutGoalBeenReachedOrExceeded =
      await this.hasWorkoutGoalBeenReachedOrExceeded(
        userStats.weeklyWorkoutGoalAchievedAt,
        workout.createdAt,
        userProfile.weeklyWorkoutGoal,
        userId,
        daysWithWorkoutsThisWeek,
      );

    const { newWeeklyGoalAchievedAt, newWeeklyStreak } =
      this.getUpdatedWeeklyStreakAndWeeklyGoalAchievedAt(
        userStats,
        userProfile,
        hasWorkoutGoalBeenReachedOrExceeded,
        daysWithWorkoutsThisWeek,
      );

    const workoutXp = this.calculateWorkoutXp(
      workout,
      userId,
      hasWorkoutGoalBeenReachedOrExceeded,
      userProfile.weeklyWorkoutGoal,
      newWeeklyStreak,
      daysWithWorkoutsThisWeek,
    );
    workout.gainedXp = workoutXp.totalWorkoutXp;

    const createdWorkout = await this.saveWorkout(workout, userId);

    const updatedUserStats = await this.updateUserStatsAfterWorkout(
      userStats,
      workoutXp.totalWorkoutXp,
      newWeeklyGoalAchievedAt,
      newWeeklyStreak,
    );

    return this.getCreatedWorkoutModel(
      createdWorkout!,
      workoutXp,
      userStats,
      updatedUserStats,
      daysWithWorkoutsThisWeek,
    );
  }

  private async saveWorkout(
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<WorkoutModel> {
    try {
      const createdWorkoutId = await this.createWorkoutRepo.createWorkout(
        workout,
        userId,
      );
      return await this.getWorkoutService.getWorkoutDetails(
        createdWorkoutId,
        userId,
      );
    } catch (e) {
      throw new CouldNotSaveWorkoutException(e);
    }
  }

  private async updateUserStatsAfterWorkout(
    currentUserStats: UserStats,
    totalWorkoutXp: number,
    newWeeklyGoalAchievedAt: Date | null,
    newWeeklyStreak: number,
  ): Promise<UserStats> {
    const { newLevel, newCurrentXp } =
      this.levelCalculator.calculateNewLevelAndCurrentXp(
        currentUserStats.level,
        currentUserStats.currentXp,
        totalWorkoutXp,
      );
    const newUserStats = new UserStats();
    newUserStats.totalXp = newCurrentXp;
    newUserStats.level = newLevel;
    newUserStats.currentXp = newCurrentXp;
    newUserStats.totalXp = currentUserStats.totalXp + totalWorkoutXp;
    newUserStats.weeklyWorkoutGoalAchievedAt = newWeeklyGoalAchievedAt;
    newUserStats.weeklyWorkoutGoalStreak = newWeeklyStreak;

    await this.userService.updateUserStats(
      currentUserStats.userId,
      newUserStats,
    );
    return await this.userService.getStatsByUserId(currentUserStats.userId);
  }

  private getCreatedWorkoutModel(
    createdWorkout: WorkoutModel,
    workoutXp: ICalculateWorkoutXp,
    oldUserStats: UserStats,
    newUserStats: UserStats,
    daysWithWorkoutsThisWeek: number,
  ): CreateWorkout {
    return {
      workout: createdWorkout,
      workoutStats: workoutXp,
      userStatsBeforeWorkout: {
        level: oldUserStats.level,
        currentXp: oldUserStats.currentXp,
      },
      userStatsAfterWorkout: {
        level: newUserStats.level,
        currentXp: newUserStats.currentXp,
        xpNeededForCurrentLevel:
          this.levelCalculator.getXpNeededForCurrentLevel(newUserStats.level),
        daysWithWorkoutsThisWeek: daysWithWorkoutsThisWeek,
      },
    };
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

  private getUpdatedWeeklyStreakAndWeeklyGoalAchievedAt(
    userStats: UserStats,
    userProfile: UserProfileModel,
    hasWorkoutGoalBeenReachedOrExceeded: boolean,
    daysWithWorkoutsThisWeek: number,
  ): { newWeeklyStreak: number; newWeeklyGoalAchievedAt: Date | null } {
    let newWeeklyGoalAchievedAt = userStats.weeklyWorkoutGoalAchievedAt;
    let newWeeklyStreak = userStats.weeklyWorkoutGoalStreak;

    if (
      hasWorkoutGoalBeenReachedOrExceeded &&
      daysWithWorkoutsThisWeek === userProfile.weeklyWorkoutGoal
    ) {
      const nowInUtcAsString = new Date().toISOString();
      newWeeklyGoalAchievedAt = new Date(nowInUtcAsString);
      newWeeklyStreak++;
    }

    return { newWeeklyStreak, newWeeklyGoalAchievedAt };
  }
}
