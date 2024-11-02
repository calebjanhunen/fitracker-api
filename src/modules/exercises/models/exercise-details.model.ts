import { AutoMap } from '@automapper/classes';
import { WorkoutSetModel } from 'src/modules/workouts/models';

export class ExerciseWorkoutHistoryModel {
  @AutoMap()
  name: string;
  @AutoMap()
  createdAt: Date;
  @AutoMap(() => WorkoutSetModel)
  sets: WorkoutSetModel[];
}
