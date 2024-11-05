import { AutoMap } from '@automapper/classes';
import { ExerciseWorkoutHistoryDto } from './exercise-workout-history.dto';

export class ExerciseDetailsDto {
  @AutoMap()
  public id: string;
  @AutoMap()
  public name: string;
  @AutoMap()
  public bodyPart: string;
  @AutoMap()
  public equipment: string;
  @AutoMap()
  public isCustom: boolean;
  @AutoMap(() => [ExerciseWorkoutHistoryDto])
  public workoutHistory: ExerciseDetailsDto[];
}
