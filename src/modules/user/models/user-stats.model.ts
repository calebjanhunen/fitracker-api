import { AutoMap } from '@automapper/classes';

export class UserStats {
  userId: string;
  @AutoMap()
  totalXp: number;
  @AutoMap()
  weeklyWorkoutGoalAchievedAt: Date | null;
  weeklyWorkoutGoalStreak: number;
  level: number;
  currentXp: number;
}
