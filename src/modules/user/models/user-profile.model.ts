import { AutoMap } from '@automapper/classes';

export class UserProfileModel {
  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  weeklyWorkoutGoal: number;

  @AutoMap()
  totalXp: number;

  @AutoMap()
  level: number;
  @AutoMap()
  currentXp: number;

  @AutoMap()
  xpNeededForCurrentLevel: number;

  @AutoMap()
  role: string;
}
