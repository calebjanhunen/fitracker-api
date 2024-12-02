import { WorkoutModel } from '../models';

export interface ICreateWorkout {
  workout: WorkoutModel;
  workoutStats: WorkoutStats;
}

export interface WorkoutStats {
  totalWorkoutXp: number;
  workoutEffortXp: number;
}
