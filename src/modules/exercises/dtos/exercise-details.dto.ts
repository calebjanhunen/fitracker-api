import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseWorkoutHistoryDto } from './exercise-workout-history.dto';

export class ExerciseDetailsDto {
  @AutoMap()
  @ApiProperty()
  public id: string;
  @AutoMap()
  @ApiProperty()
  public name: string;
  @AutoMap()
  @ApiProperty()
  public bodyPart: string;
  @AutoMap()
  @ApiProperty()
  public equipment: string;
  @AutoMap()
  @ApiProperty()
  public isCustom: boolean;
  @AutoMap(() => [ExerciseWorkoutHistoryDto])
  @ApiProperty({ type: ExerciseWorkoutHistoryDto, isArray: true })
  public workoutHistory: ExerciseWorkoutHistoryDto[];
}
