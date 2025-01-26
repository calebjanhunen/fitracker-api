import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class WorkoutSummaryExerciseDto {
  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public exerciseId: string;

  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public name: string;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  public numberOfSets: number;
}
