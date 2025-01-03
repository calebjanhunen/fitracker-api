import { AutoMap } from '@automapper/classes';
import { WorkoutModel } from './workout.model';

export class WorkoutStats {
  @AutoMap()
  totalWorkoutXp: number;
  @AutoMap()
  workoutEffortXp: number;
  @AutoMap()
  workoutGoalXp: number;
}

export class CreateWorkout {
  @AutoMap(() => WorkoutModel)
  workout: WorkoutModel;
  @AutoMap(() => WorkoutStats)
  workoutStats: WorkoutStats;
}
