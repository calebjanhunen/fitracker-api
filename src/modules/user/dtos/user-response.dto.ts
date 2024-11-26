import { AutoMap } from '@automapper/classes';

export class UserResponseDto {
  @AutoMap()
  id: string;
  @AutoMap()
  username: string;
  @AutoMap()
  firstName: string;
  @AutoMap()
  lastName: string;
  @AutoMap()
  totalXp: string;
  @AutoMap()
  weeklyWorkoutGoal: number;
}
