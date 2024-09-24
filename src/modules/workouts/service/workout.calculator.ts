import { Injectable } from '@nestjs/common';
import { ICalculateGainedXp } from '../interfaces/calculate-gained-xp.interface';
import { InsertWorkoutModel, WorkoutModel } from '../models';

@Injectable()
export class WorkoutCalculator {
  private readonly BASE_XP_GAIN = 50;
  private readonly MIN_WORKOUT_DURATION_FOR_XP = 900; // 15 mins in seconds
  private readonly DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
  private readonly XP_FOR_EACH_WORKOUT_MINUTE = 10;
  private readonly XP_FOR_EACH_DAY_OF_CURRENT_STREAK = 10;

  public calculateGainedXp(
    workout: InsertWorkoutModel,
    currentWorkoutStreak: number,
  ): ICalculateGainedXp {
    let xpGainedFromWorkoutDuration = 0;
    let xpGainedFromWorkoutStreak = 0;

    // If workout >= 15 mins -> add 10 xp for each minute of the workout
    if (workout.duration >= this.MIN_WORKOUT_DURATION_FOR_XP) {
      const workoutLengthInMinutes = Math.floor(workout.duration / 60);
      xpGainedFromWorkoutDuration =
        workoutLengthInMinutes * this.XP_FOR_EACH_WORKOUT_MINUTE;
    }

    // If streak is at 3 days -> add 10 xp for each day minus the first 2 days
    if (currentWorkoutStreak > 2) {
      xpGainedFromWorkoutStreak =
        (currentWorkoutStreak - 2) * this.XP_FOR_EACH_DAY_OF_CURRENT_STREAK;
    }

    return {
      baseXpGain: this.BASE_XP_GAIN,
      xpGainedFromWorkoutDuration,
      xpGainedFromWorkoutStreak,
      totalGainedXp:
        this.BASE_XP_GAIN +
        xpGainedFromWorkoutDuration +
        xpGainedFromWorkoutStreak,
    };
  }

  /**
   * Get number of days between 2 days (not including the hour of day)
   * @param {Date} date1
   * @param {Date} date2 - Second date -> this one must be greater than or equal to the 1st date
   * @returns {number} The difference between the 2 days.
   */
  public getDifferenceInDays(date1: Date | null, date2: Date): number {
    if (!date1) {
      return Infinity;
    }
    // Get normalized dates so time for both is the same (00:00)
    const normalizedDate1 = new Date(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate(),
    );
    const normalizedDate2 = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate(),
    );

    const differenceInDays =
      (normalizedDate2.getTime() - normalizedDate1.getTime()) /
      this.DAY_IN_MILLISECONDS;

    return differenceInDays;
  }

  public recalculateCurrentWorkoutStreak(
    remainingWorkouts: WorkoutModel[],
  ): number {
    if (!remainingWorkouts.length) {
      return 0;
    }

    const newLatestWorkoutDate = new Date(remainingWorkouts[0].createdAt);
    const today = new Date();
    const differenceBetweenTodayAndNewLatestWorkout = this.getDifferenceInDays(
      newLatestWorkoutDate,
      today,
    );

    let newCurrentStreak = 0;

    // If latest workout is today or yesterday (if not, streak is 0)
    if (differenceBetweenTodayAndNewLatestWorkout <= 1) {
      let lastWorkoutDate: Date = newLatestWorkoutDate;

      newCurrentStreak = 1;
      // Loop through remaining workouts starting at second workout
      for (const workout of remainingWorkouts.slice(1)) {
        const diff = this.getDifferenceInDays(
          new Date(workout.createdAt),
          new Date(lastWorkoutDate),
        );
        console.log(diff, lastWorkoutDate, workout.createdAt);

        if (diff === 1) {
          newCurrentStreak++;
        } else if (diff > 1) {
          break;
        }

        // If diff is 0: both workouts are on the same day, don't increase streak
        lastWorkoutDate = new Date(workout.createdAt);
      }
    }
    return newCurrentStreak;
  }
}
