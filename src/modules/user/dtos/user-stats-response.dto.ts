import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponseDto {
  @AutoMap()
  @ApiProperty()
  totalXp: number;
  @AutoMap()
  @ApiProperty()
  weeklyWorkoutGoal: number;
}
