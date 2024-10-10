import { AutoMap } from '@automapper/classes';

export class UserStats {
  @AutoMap()
  totalXp: number;
  @AutoMap()
  weeklyWorkoutGoal: number;
  weeklyBonusAwardedAt: Date;
  weeklyWorkoutGoalStreak: number;
}
