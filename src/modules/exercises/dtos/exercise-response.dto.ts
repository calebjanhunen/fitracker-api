import { ApiProperty } from '@nestjs/swagger';
import { ExerciseType } from '../enums/exercise-type.enum';

export class ExerciseResponseDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public equipment: string;

  @ApiProperty()
  public bodyPart: string;

  @ApiProperty()
  public isCustom: boolean;

  @ApiProperty({ enum: ExerciseType, required: true })
  public exerciseType: ExerciseType;

  @ApiProperty({ type: 'string' })
  public parentExerciseId?: string;
}
