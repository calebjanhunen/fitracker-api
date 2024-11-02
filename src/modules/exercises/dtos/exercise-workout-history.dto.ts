import { AutoMap } from '@automapper/classes';
import { WorkoutSetResponseDto } from 'src/modules/workouts/dtos/workout-response.dto';

export class ExerciseWorkoutHistoryDto {
  @AutoMap()
  id: string;
  @AutoMap()
  name: string;
  @AutoMap()
  createdAt: Date;
  @AutoMap()
  duration: number;
  @AutoMap(() => WorkoutSetResponseDto)
  sets: WorkoutSetResponseDto[];
}
