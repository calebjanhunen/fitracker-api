import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutResponseDto } from './workout-response.dto';

export class WorkoutStatsDto {
  @ApiProperty()
  @AutoMap()
  totalWorkoutXp: number;
  @ApiProperty()
  @AutoMap()
  workoutEffortXp: number;
  @ApiProperty()
  @AutoMap()
  workoutGoalXp: number;
  @ApiProperty()
  @AutoMap()
  workoutGoalStreakXp: number;
}

export class CreateWorkoutResponseDto {
  @ApiProperty()
  @AutoMap()
  workout: WorkoutResponseDto;
  @ApiProperty()
  @AutoMap(() => WorkoutStatsDto)
  workoutStats: WorkoutStatsDto;
}
