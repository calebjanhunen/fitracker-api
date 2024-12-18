import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutSetResponseDto } from 'src/modules/workouts/dtos/workout-response.dto';

export class ExerciseWorkoutHistoryDto {
  @AutoMap()
  @ApiProperty()
  id: string;
  @AutoMap()
  @ApiProperty()
  name: string;
  @AutoMap()
  @ApiProperty()
  createdAt: Date;
  @AutoMap()
  @ApiProperty()
  duration: number;
  @AutoMap(() => WorkoutSetResponseDto)
  @ApiProperty({ type: WorkoutSetResponseDto, isArray: true })
  sets: WorkoutSetResponseDto[];
}
