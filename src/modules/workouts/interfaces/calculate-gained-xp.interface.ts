import { UserStats } from 'src/modules/user/models/user-stats.model';

export interface ICalculateGainedXp {
  totalGainedXp: number;
  xpGainedFromWeeklyGoal: number;
  newUserStats: UserStats;
}
