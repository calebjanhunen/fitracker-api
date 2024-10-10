import { AutoMap } from '@automapper/classes';
import { IsIn } from 'class-validator';

export class UpdateWeeklyWorkoutGoalDto {
  @IsIn([3, 4, 5, 6])
  @AutoMap()
  weeklyWorkoutGoal: number;
}
