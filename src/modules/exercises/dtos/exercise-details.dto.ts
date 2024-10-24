import { AutoMap } from '@automapper/classes';
import { WorkoutSetResponseDto } from 'src/modules/workouts/dtos/workout-response.dto';

export class ExerciseDetailsDto {
  @AutoMap()
  name: string;
  @AutoMap(() => ExerciseWorkoutDetailsDto)
  workoutDetails: ExerciseWorkoutDetailsDto[];
}

export class ExerciseWorkoutDetailsDto {
  @AutoMap()
  workoutName: string;
  @AutoMap()
  workoutDate: Date;
  @AutoMap(() => WorkoutSetResponseDto)
  sets: WorkoutSetResponseDto[];
}
