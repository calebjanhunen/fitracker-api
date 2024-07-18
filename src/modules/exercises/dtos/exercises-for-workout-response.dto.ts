import { Expose } from 'class-transformer';
import { Set } from '../../workouts/models/set.entity';

export class ExerciseForWorkoutResponseDTO {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  primaryMuscle: string;

  @Expose()
  numTimesUsed: number;

  previousSets: Set[];
}
