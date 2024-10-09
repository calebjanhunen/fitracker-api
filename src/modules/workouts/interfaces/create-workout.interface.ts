import { WorkoutModel } from '../models';

export interface ICreateWorkout {
  workout: WorkoutModel;
  workoutStats: WorkoutStats;
}

export interface WorkoutStats {
  baseXpGain: number;
  xpGainedFromWorkoutDuration: number;
  xpGainedFromWeeklyGoal: number;
  totalGainedXp: number;
  totalUserXp: number;
}
