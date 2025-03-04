import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseType } from '../enums/exercise-type.enum';
import { RecentSetDto } from './recent-workout-set.dto';

export class ExerciseResponseDto {
  @ApiProperty()
  @AutoMap()
  public id: string;

  @ApiProperty()
  @AutoMap()
  public name: string;

  @ApiProperty()
  @AutoMap()
  public equipment: string;

  @ApiProperty()
  @AutoMap()
  public bodyPart: string;

  @ApiProperty()
  @AutoMap()
  public isCustom: boolean;

  @ApiProperty({ enum: ExerciseType, required: true })
  @AutoMap()
  public exerciseType: ExerciseType;

  @ApiProperty({ type: 'string', required: false })
  @AutoMap()
  public parentExerciseId?: string;

  @ApiProperty({ type: 'integer', required: false })
  @AutoMap()
  public numTimesUsed?: number;

  @ApiProperty({ type: RecentSetDto, required: false, isArray: true })
  @AutoMap(() => RecentSetDto)
  public mostRecentWorkoutSets?: RecentSetDto[];
}
