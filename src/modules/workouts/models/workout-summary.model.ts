import { AutoMap } from '@automapper/classes';
import { WorkoutSummaryExerciseModel } from './workout-summary-exercise.model';

export class WorkoutSummaryModel {
  @AutoMap()
  public id: string;

  @AutoMap()
  public name: string;

  @AutoMap()
  public workoutDate: Date;

  @AutoMap()
  public duration: number;

  @AutoMap(() => WorkoutSummaryExerciseModel)
  public exercises: WorkoutSummaryExerciseModel[];
}
