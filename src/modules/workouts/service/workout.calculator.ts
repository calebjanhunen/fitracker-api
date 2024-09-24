import { Injectable } from '@nestjs/common';
import { InsertWorkoutModel } from '../models';

@Injectable()
export class WorkoutCalculator {
  private readonly BASE_XP_GAIN = 50;
  private readonly MIN_WORKOUT_DURATION_FOR_XP = 900; // 15 mins in seconds
  private readonly DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

  public calculateGainedXp(workout: InsertWorkoutModel): number {
    let gainedXpFromWorkoutLength = 0;

    // If workout >= 15 mins -> add 10 xp for each minute of the workout
    if (workout.duration >= this.MIN_WORKOUT_DURATION_FOR_XP) {
      const workoutLengthInMinutes = Math.floor(workout.duration / 60);
      gainedXpFromWorkoutLength = workoutLengthInMinutes * 10;
    }

    return this.BASE_XP_GAIN + gainedXpFromWorkoutLength;
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
