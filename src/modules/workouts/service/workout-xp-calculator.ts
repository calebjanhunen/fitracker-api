import { InsertWorkoutModel } from '../models';

interface ICalculateWorkoutXp {
  totalXpGained: number;
  xpGainedFromWorkoutDuration: number;
}

export class WorkoutXpCalculator {
  private readonly MIN_WORKOUT_DURATION_FOR_XP_MS = 60 * 1000 * 15; // 15 minutes
  private readonly XP_FOR_EACH_WORKOUT_MINUTE = 1;
  private readonly MS_TO_MIN_CONVERSION = 60000;
  constructor() {}

  public calculateWorkoutXp(workout: InsertWorkoutModel): ICalculateWorkoutXp {
    const xpGainedFromWorkoutDuration =
      this.calculateXpGainedFromWorkoutDuration(workout);

    return {
      totalXpGained: xpGainedFromWorkoutDuration,
      xpGainedFromWorkoutDuration,
    };
  }

  /**
   * Calculates xp gained from workout duration if workout is longer than 15 minutes
   *    - Gives 1 xp for every minute of the workout
   * @param {InsertWorkoutModel} workout
   * @returns {number}
   */
  private calculateXpGainedFromWorkoutDuration(
    workout: InsertWorkoutModel,
  ): number {
    const actualWorkoutDuration =
      workout.lastUpdatedAt.getTime() - workout.createdAt.getTime();

    if (actualWorkoutDuration >= this.MIN_WORKOUT_DURATION_FOR_XP_MS) {
      const workoutLengthInMinutes = Math.floor(
        actualWorkoutDuration / this.MS_TO_MIN_CONVERSION,
      );

      return workoutLengthInMinutes * this.XP_FOR_EACH_WORKOUT_MINUTE;
    } else {
      return 0;
    }
  }
}
