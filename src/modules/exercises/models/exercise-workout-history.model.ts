import { AutoMap } from '@automapper/classes';
import { WorkoutSetModel } from 'src/modules/workouts/models';

export class ExerciseWorkoutHistoryModel {
  @AutoMap()
  id: string;
  @AutoMap()
  name: string;
  @AutoMap()
  createdAt: Date;
  @AutoMap()
  duration: number;
  @AutoMap(() => WorkoutSetModel)
  sets: WorkoutSetModel[];
}
