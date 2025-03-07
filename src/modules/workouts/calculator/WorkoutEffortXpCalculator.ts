import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';
import { InsertWorkoutModel, InsertWorkoutSetModel } from '../models';

@Injectable()
export class WorkoutEffortXpCalculator {
  private readonly MS_TO_SECOND_CONVERSION = 1000;
  private readonly MAX_RPE = 10;
  private readonly MIN_RPE = 5;
  private readonly SUGGESTED_MIN_TIME_PER_SET_SECONDS = 30;
  private readonly SUGGESTED_MAX_TIME_PER_SET_SECONDS = 60;
  private readonly SUGGESTED_MIN_TIME_REST_TIME_SECONDS = 60; // 1 minute
  private readonly SUGGESTED_MAX_TIME_REST_TIME_SECONDS = 60 * 3; // 3 minutes
  private readonly TRANSITION_TIME_BETWEEN_EXERCISES_SECONDS = 60 * 5; // 5 minutes
  private readonly DURATION_FACTOR_DECAY_RATE = 0.0005;
  private readonly WORKOUT_EFFORT_XP_MULTIPLIER = 1;
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(WorkoutEffortXpCalculator.name);
  }

  /**
   * Calculates the amount of xp gained from workout effort
   * @param {InsertWorkoutModel} workout
   * @returns {number}
   */
  public calculateWorkoutEffortXp(
    workout: InsertWorkoutModel,
    userId: string,
  ): number {
    const actualWorkoutDurationSeconds =
      (workout.lastUpdatedAt.getTime() - workout.createdAt.getTime()) /
      this.MS_TO_SECOND_CONVERSION;

    const totalWorkoutEffort = this.calculateWorkoutEffortWithWorkoutDuration(
      workout,
      actualWorkoutDurationSeconds,
      userId,
    );

    const workoutEffortXp = Math.round(
      totalWorkoutEffort * this.WORKOUT_EFFORT_XP_MULTIPLIER,
    );

    return workoutEffortXp;
  }

  /**
   * Calculates the workout effort while taking the workout duration into account
   * @param {InsertWorkoutModel} workout
   * @param {number} workoutDurationSeconds
   * @returns {number}
   */
  private calculateWorkoutEffortWithWorkoutDuration(
    workout: InsertWorkoutModel,
    workoutDurationSeconds: number,
    userId: string,
  ): number {
    const { numExercises, numSets } =
      this.getNumberOfExercisesAndSetsInWorkout(workout);

    const { minBaselineDurationSeconds, maxBaselineDurationSeconds } =
      this.calculateBaselineWorkoutTimesInSeconds(numSets, numExercises);

    let durationFactor: number;
    if (this.configService.get('IGNORE_MIN_BASELINE_DURATION')) {
      durationFactor = this.calculateWorkoutDurationIgnoringMinBaselineDuration(
        workoutDurationSeconds,
        maxBaselineDurationSeconds,
      );
    } else {
      durationFactor = this.calculateWorkoutDurationWithMinBaselineDuration(
        workoutDurationSeconds,
        minBaselineDurationSeconds,
        maxBaselineDurationSeconds,
      );
    }

    const workoutEffort = this.calculateWorkoutEffort(workout);
    this.logger.log(
      `Workout effort calculated for user ${userId}. Workout Duration: ${workoutDurationSeconds}, Min Baseline Duration: ${minBaselineDurationSeconds}, Max Baseline Duration: ${maxBaselineDurationSeconds} Effort: ${workoutEffort}, Duration Factor: ${durationFactor}.`,
      {
        workoutDuration: workoutDurationSeconds,
        minBaselineDuration: minBaselineDurationSeconds,
        maxBaselineDuration: maxBaselineDurationSeconds,
        workoutEffort,
        durationFactor,
      },
    );
    return workoutEffort * durationFactor;
  }

  private calculateWorkoutDurationIgnoringMinBaselineDuration(
    workoutDurationSeconds: number,
    maxBaselineDurationSeconds: number,
  ): number {
    if (workoutDurationSeconds <= maxBaselineDurationSeconds) {
      return 1;
    } else {
      return Math.exp(
        -this.DURATION_FACTOR_DECAY_RATE *
          (workoutDurationSeconds - maxBaselineDurationSeconds),
      );
    }
  }

  private calculateWorkoutDurationWithMinBaselineDuration(
    workoutDurationSeconds: number,
    minBaselineDurationSeconds: number,
    maxBaselineDurationSeconds: number,
  ): number {
    if (
      workoutDurationSeconds > minBaselineDurationSeconds &&
      workoutDurationSeconds <= maxBaselineDurationSeconds
    ) {
      return 1;
    } else if (workoutDurationSeconds <= minBaselineDurationSeconds) {
      return Math.exp(
        -this.DURATION_FACTOR_DECAY_RATE *
          (minBaselineDurationSeconds - workoutDurationSeconds),
      );
    } else {
      return Math.exp(
        -this.DURATION_FACTOR_DECAY_RATE *
          (workoutDurationSeconds - maxBaselineDurationSeconds),
      );
    }
  }

  /**
   * Calculates the workout effort by summing all set efforts
   * @param {InsertWorkoutModel} workout
   * @returns {number}
   */
  private calculateWorkoutEffort(workout: InsertWorkoutModel): number {
    let workoutEffort = 0;
    for (const exercise of workout.exercises) {
      let exerciseEffort = 0;
      for (const set of exercise.sets) {
        exerciseEffort += this.calculateSetEffort(set);
      }
      workoutEffort += exerciseEffort;
    }

    return workoutEffort;
  }

  /**
   * Calculates a numerical value for the effort of a set
   *  - Uses relative weight so a set with more weight doesn't automatically result in more effort
   * @param {InsertWorkoutSetModel} set
   * @returns {number}
   */
  private calculateSetEffort(set: InsertWorkoutSetModel): number {
    const oneRepMaxInLbs = this.getOneRepMax(set);
    let relativeWeight = 0;
    if (oneRepMaxInLbs > 0) {
      relativeWeight = set.weight / oneRepMaxInLbs;
    }
    const intensityFactor = set.rpe
      ? (set.rpe - this.MIN_RPE) / this.MIN_RPE
      : 1;
    return relativeWeight * set.reps * intensityFactor;
  }

  /**
   * Calculates the minimum and maximum duration a workout should be based on the number of sets and exercises
   * @param {number} numSets
   * @param {number} numExercises
   * @returns {number}
   */
  private calculateBaselineWorkoutTimesInSeconds(
    numSets: number,
    numExercises: number,
  ): {
    minBaselineDurationSeconds: number;
    maxBaselineDurationSeconds: number;
  } {
    // TODO: Find a way to more accurately get the min and max baseline times based on goals, exercise type, etc
    const minBaselineDurationSeconds =
      numSets * this.SUGGESTED_MIN_TIME_PER_SET_SECONDS +
      numSets * this.SUGGESTED_MIN_TIME_REST_TIME_SECONDS +
      (numExercises - 1) * this.TRANSITION_TIME_BETWEEN_EXERCISES_SECONDS;

    const maxBaselineDurationSeconds =
      numSets * this.SUGGESTED_MAX_TIME_PER_SET_SECONDS +
      numSets * this.SUGGESTED_MAX_TIME_REST_TIME_SECONDS +
      (numExercises - 1) * this.TRANSITION_TIME_BETWEEN_EXERCISES_SECONDS;

    return { minBaselineDurationSeconds, maxBaselineDurationSeconds };
  }

  private getNumberOfExercisesAndSetsInWorkout(workout: InsertWorkoutModel): {
    numExercises: number;
    numSets: number;
  } {
    const numExercises = workout.exercises.length;
    const numSets = workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);

    return { numExercises, numSets };
  }

  /**
   * Calculates the one rep max for a set using the Epley formula
   *  - Uses set reps + (MAX_RPE - set rpe) to get the maximum number of reps if the rpe was 10
   * @param {InsertWorkoutSetModel} set
   * @returns {number}
   */
  private getOneRepMax(set: InsertWorkoutSetModel): number {
    const weightInKg = this.convertWeight(set.weight, 'lbs', 'kg');
    const maxReps = set.rpe ? set.reps + (this.MAX_RPE - set.rpe) : set.reps;

    const oneRepMaxInKg = weightInKg * (1 + maxReps / 30);
    return Math.round(this.convertWeight(oneRepMaxInKg, 'kg', 'lbs'));
  }

  /**
   * Converts the input weight from lbs to kg or vice versa
   * @param {number} weight
   * @param {'lbs' | 'kg'} originalUnit - Unit of the input weight
   * @param {'lbs' | 'kg'} resultUnit - Unit of the desired weight
   * @returns {number}
   */
  private convertWeight(
    weight: number,
    originalUnit: 'lbs' | 'kg',
    resultUnit: 'lbs' | 'kg',
  ): number {
    if (originalUnit === 'lbs' && resultUnit === 'kg') {
      return weight / 2.205;
    } else if (originalUnit === 'kg' && resultUnit === 'lbs') {
      return weight * 2.205;
    }
    return weight;
  }
}
