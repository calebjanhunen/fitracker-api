import { AutoMap } from '@automapper/classes';

export class WorkoutSummaryExerciseModel {
  public workoutExerciseId: string;

  @AutoMap()
  public exerciseId: string;

  @AutoMap()
  public name: string;

  @AutoMap()
  public numberOfSets: number;
}
