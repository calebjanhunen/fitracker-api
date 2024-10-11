import { AutoMap } from '@automapper/classes';

export class UserStats {
  userId: string;
  @AutoMap()
  totalXp: number;
  @AutoMap()
  weeklyWorkoutGoal: number;
  weeklyBonusAwardedAt: Date;
  weeklyWorkoutGoalStreak: number;
}
