import { AutoMap } from '@automapper/classes';
import { WorkoutModel } from './workout.model';

export class WorkoutStats {
  @AutoMap()
  totalWorkoutXp: number;
  @AutoMap()
  workoutEffortXp: number;
  @AutoMap()
  workoutGoalXp: number;
  @AutoMap()
  workoutGoalStreakXp: number;
}

export class UserStatsBeforeWorkout {
  @AutoMap()
  level: number;

  @AutoMap()
  currentXp: number;
}

export class UserStatsAfterWorkout {
  @AutoMap()
  level: number;

  @AutoMap()
  currentXp: number;

  @AutoMap()
  xpNeededForCurrentLevel: number;

  @AutoMap()
  daysWithWorkoutsThisWeek: number;
}

export class CreateWorkout {
  @AutoMap(() => WorkoutModel)
  workout: WorkoutModel;
  @AutoMap(() => WorkoutStats)
  workoutStats: WorkoutStats;
  @AutoMap(() => UserStatsBeforeWorkout)
  userStatsBeforeWorkout: UserStatsBeforeWorkout;
  @AutoMap(() => UserStatsAfterWorkout)
  userStatsAfterWorkout: UserStatsAfterWorkout;
}
