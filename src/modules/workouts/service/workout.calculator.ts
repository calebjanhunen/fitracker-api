import { Injectable } from '@nestjs/common';
import { InsertWorkoutModel } from '../models';

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
  ): number {
    let gainedXpFromWorkoutLength = 0;
    let xpGainedFromWorkoutStreak = 0;

    // If workout >= 15 mins -> add 10 xp for each minute of the workout
    if (workout.duration >= this.MIN_WORKOUT_DURATION_FOR_XP) {
      const workoutLengthInMinutes = Math.floor(workout.duration / 60);
      gainedXpFromWorkoutLength =
        workoutLengthInMinutes * this.XP_FOR_EACH_WORKOUT_MINUTE;
    }

    // If streak is at 3 days -> add 10 xp for each day minus the first 2 days
    if (currentWorkoutStreak > 2) {
      xpGainedFromWorkoutStreak =
        (currentWorkoutStreak - 2) * this.XP_FOR_EACH_DAY_OF_CURRENT_STREAK;
    }

    return (
      this.BASE_XP_GAIN + gainedXpFromWorkoutLength + xpGainedFromWorkoutStreak
    );
  }

  public getDifferenceInDays(lastWorkoutDate: Date, createdWorkoutDate: Date) {
    const normalizedDate1 = new Date(
      lastWorkoutDate.getFullYear(),
      lastWorkoutDate.getMonth(),
      lastWorkoutDate.getDate(),
    );
    const normalizedDate2 = new Date(
      createdWorkoutDate.getFullYear(),
      createdWorkoutDate.getMonth(),
      createdWorkoutDate.getDate(),
    );

    const differenceInDays =
      (normalizedDate2.getTime() - normalizedDate1.getTime()) /
      this.DAY_IN_MILLISECONDS;

    return differenceInDays;
  }
}
