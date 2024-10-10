import { WorkoutModel } from '../models';

export interface ICreateWorkout {
  workout: WorkoutModel;
  workoutStats: WorkoutStats;
}

export interface WorkoutStats {
  xpGainedFromWeeklyGoal: number;
  totalGainedXp: number;
  totalUserXp: number;
}
