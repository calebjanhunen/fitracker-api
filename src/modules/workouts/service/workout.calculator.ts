import { Injectable } from '@nestjs/common';
import { UserStats } from 'src/modules/user/models/user-stats.model';
import { ICalculateGainedXp } from '../interfaces/calculate-gained-xp.interface';
import { InsertWorkoutModel } from '../models';
import { WorkoutRepository } from '../repository/workout.repository';

@Injectable()
export class WorkoutCalculator {
  private readonly MIN_WORKOUT_DURATION_FOR_XP = 900; // 15 mins in seconds
  private readonly XP_FOR_EACH_WORKOUT_MINUTE = 10;
  private readonly WEEKLY_GOAL_XP_VALUES = {
    baseXp: 30,
    multiplier: 10,
    weeklyGoalStreakBaseXp: 10,
    maxWeeklyGoalStreakXp: 100,
  };
  private readonly MIN_STREAK_TO_RECEIVE_XP = 2;

  constructor(private workoutRepo: WorkoutRepository) {}

  public async calculateXpGainedFromWorkout(
    workout: InsertWorkoutModel,
    userStats: UserStats,
    userId: string,
  ): Promise<ICalculateGainedXp> {
    const updatedUserStats = new UserStats();
    // let xpGainedFromWorkoutDuration = 0;
    let xpGainedFromWeeklyGoal = 0;

    // TODO: Rework to discourage unnecessarily long workouts
    // If workout >= 15 mins -> add 10 xp for each minute of the workout
    // if (workout.duration >= this.MIN_WORKOUT_DURATION_FOR_XP) {
    //   const workoutLengthInMinutes = Math.floor(workout.duration / 60);
    //   xpGainedFromWorkoutDuration =
    //     workoutLengthInMinutes * this.XP_FOR_EACH_WORKOUT_MINUTE;
    // }

    const workoutsCompletedThisWeek =
      await this.workoutRepo.findWorkoutsThisWeekWithDistinctDates(
        userId,
        workout.createdAt,
      );

    if (
      !this.alreadyReceivedWeeklyWorkoutGoalXpThisWeek(
        userStats.weeklyBonusAwardedAt,
      )
    ) {
      // Give bonus xp if a user hits their weekly workout goal
      let newWeeklyGoalStreak = 0;
      if (
        workoutsCompletedThisWeek.length + 1 ===
        userStats.weeklyWorkoutGoal
      ) {
        newWeeklyGoalStreak = userStats.weeklyWorkoutGoalStreak + 1;
        xpGainedFromWeeklyGoal =
          this.WEEKLY_GOAL_XP_VALUES.baseXp +
          userStats.weeklyWorkoutGoal * this.WEEKLY_GOAL_XP_VALUES.multiplier;
      }

      // Give bonus xp if user hit weekly goal at least 2 weeks in a row
      if (newWeeklyGoalStreak >= this.MIN_STREAK_TO_RECEIVE_XP) {
        if (newWeeklyGoalStreak >= 10) {
          // Cap bonus xp at 100 (10 weeks * 10xp for each week)
          xpGainedFromWeeklyGoal +=
            this.WEEKLY_GOAL_XP_VALUES.maxWeeklyGoalStreakXp;
        } else {
          xpGainedFromWeeklyGoal +=
            this.WEEKLY_GOAL_XP_VALUES.weeklyGoalStreakBaseXp *
            newWeeklyGoalStreak;
        }
      }

      updatedUserStats.weeklyWorkoutGoalStreak = newWeeklyGoalStreak;
      userStats.weeklyBonusAwardedAt = new Date(workout.createdAt);
    }

    const totalGainedXp = xpGainedFromWeeklyGoal;
    updatedUserStats.totalXp = userStats.totalXp + totalGainedXp;
    return {
      xpGainedFromWeeklyGoal,
      totalGainedXp,
      newUserStats: updatedUserStats,
    };
  }

  /**
   * Returns true if a date is in the current week, false if not
   *
   * @param {Date} date - the date in UTC
   */
  private alreadyReceivedWeeklyWorkoutGoalXpThisWeek(date: Date): boolean {
    const startOfWeek = this.getStartOfWeek();
    return date >= startOfWeek;
  }

  /**
   * Gets the start of the current week (Sunday at 12am in UTC)
   * @returns {Date} - Sunday: 00:00 UTC of current week
   */
  private getStartOfWeek(): Date {
    const now = new Date();

    // Set the start of the current week (Sunday at 12:00 AM)
    const startOfWeek = new Date(now);
    startOfWeek.setUTCHours(0, 0, 0, 0); // Set to 12:00 AM
    startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay()); // Set to Sunday

    return startOfWeek;
  }
}
