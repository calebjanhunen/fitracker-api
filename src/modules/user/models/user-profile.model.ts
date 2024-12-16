import { AutoMap } from '@automapper/classes';

export class UserProfileModel {
  @AutoMap()
  firstName: string;
  @AutoMap()
  lastName: string;
  @AutoMap()
  totalXp: number;
  @AutoMap()
  weeklyWorkoutGoal: number;
}
