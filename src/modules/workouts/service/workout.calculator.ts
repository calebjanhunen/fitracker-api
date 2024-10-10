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
  };

  constructor(private workoutRepo: WorkoutRepository) {}

  public async calculateXpGainedFromWorkout(
    workout: InsertWorkoutModel,
    userStats: UserStats,
    userId: string,
  ): Promise<ICalculateGainedXp> {
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

    if (!this.isDateThisWeek(userStats.weeklyBonusAwardedAt)) {
      // Give bonus xp if a user hits their weekly workout goal
      if (
        workoutsCompletedThisWeek.length + 1 ===
        userStats.weeklyWorkoutGoal
      ) {
        xpGainedFromWeeklyGoal =
          this.WEEKLY_GOAL_XP_VALUES.baseXp +
          userStats.weeklyWorkoutGoal * this.WEEKLY_GOAL_XP_VALUES.multiplier;
      }
    }

    return {
      xpGainedFromWeeklyGoal,
      totalGainedXp: xpGainedFromWeeklyGoal,
    };
  }

  /**
   * Returns true if a date is in the current week, false if not
   *
   * @param {Date} date - the date in UTC
   */
  private isDateThisWeek(date: Date): boolean {
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
