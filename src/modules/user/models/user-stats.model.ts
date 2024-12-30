import { AutoMap } from '@automapper/classes';

export class UserStats {
  userId: string;
  @AutoMap()
  totalXp: number;
  @AutoMap()
  weeklyBonusAwardedAt: Date;
  weeklyWorkoutGoalStreak: number;
}
