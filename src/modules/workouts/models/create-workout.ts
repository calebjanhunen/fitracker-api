import { AutoMap } from '@automapper/classes';
import { WorkoutModel } from '.';

export class WorkoutStats {
  @AutoMap()
  totalWorkoutXp: number;
  @AutoMap()
  workoutEffortXp: number;
}

export class CreateWorkout {
  @AutoMap(() => WorkoutModel)
  workout: WorkoutModel;
  @AutoMap(() => WorkoutStats)
  workoutStats: WorkoutStats;
}
