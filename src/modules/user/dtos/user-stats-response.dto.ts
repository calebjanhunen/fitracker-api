import { AutoMap } from '@automapper/classes';

export class UserStatsResponseDto {
  @AutoMap()
  totalXp: number;
  @AutoMap()
  weeklyWorkoutGoal: number;
}
