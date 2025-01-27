import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutSummaryExerciseDto } from './workout-summary-exercise.dto';

export class WorkoutSummaryDto {
  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public id: string;

  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public name: string;

  @AutoMap()
  @ApiProperty({ type: Date, required: true })
  public workoutDate: Date;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  public duration: number;

  @AutoMap(() => WorkoutSummaryExerciseDto)
  @ApiProperty({
    type: WorkoutSummaryExerciseDto,
    required: true,
    isArray: true,
  })
  public exercises: WorkoutSummaryExerciseDto[];
}
