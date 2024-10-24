import { AutoMap } from '@automapper/classes';
import { WorkoutSetModel } from 'src/modules/workouts/models';

export class ExerciseDetailsModel {
  @AutoMap()
  name: string;
  @AutoMap(() => ExerciseWorkoutDetailsModel)
  workoutDetails: ExerciseWorkoutDetailsModel[];
}

export class ExerciseWorkoutDetailsModel {
  @AutoMap()
  workoutName: string;
  @AutoMap()
  workoutDate: Date;
  @AutoMap(() => WorkoutSetModel)
  sets: WorkoutSetModel[];
}
