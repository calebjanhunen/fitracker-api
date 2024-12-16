import { ApiProperty } from '@nestjs/swagger';
import { WorkoutResponseDto } from './workout-response.dto';

class WorkoutStatsDto {
  @ApiProperty()
  totalWorkoutXp: number;
  @ApiProperty()
  workoutEffortXp: number;
}

export class CreateWorkoutResponseDto {
  @ApiProperty()
  workout: WorkoutResponseDto;
  @ApiProperty()
  workoutStats: WorkoutStatsDto;
}
