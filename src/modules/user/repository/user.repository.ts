import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { UserStats } from '../models/user-stats.model';

@Injectable()
export class UserRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserRepository.name);
  }

  public async getStatsByUserId(userId: string): Promise<UserStats> {
    const query = `
      SELECT
        total_xp,
        weekly_bonus_awarded_at,
        weekly_workout_goal,
        weekly_workout_goal_streak
      FROM user_stats as us
      WHERE us.user_id = $1
    `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<UserStats>(query, params);
      return queryResult[0];
    } catch (e) {
      this.logger.error(e, 'Query GetStatsByUserId failed: ');
      throw new DatabaseException(e);
    }
  }

  public async getStatsForAllUsers(): Promise<UserStats[]> {
    const query = `
      SELECT
        user_id,
        total_xp,
        weekly_bonus_awarded_at,
        weekly_workout_goal,
        weekly_workout_goal_streak
      FROM user_stats
    `;

    try {
      const { queryResult } = await this.db.queryV2<UserStats>(query, []);
      return queryResult;
    } catch (e) {
      this.logger.error(e, 'Query getStatsForAllUsers failed: ');
      throw new DatabaseException(e);
    }
  }

  public async updateUserStats(
    updatedUserStats: UserStats,
    userId: string,
  ): Promise<UserStats> {
    const query = `
      UPDATE user_stats SET
        total_xp = $2,
        weekly_bonus_awarded_at = $3,
        weekly_workout_goal = $4,
        weekly_workout_goal_streak = $5
      WHERE  user_id = $1
      RETURNING total_xp, weekly_bonus_awarded_at, weekly_workout_goal
    `;
    const params = [
      userId,
      updatedUserStats.totalXp,
      updatedUserStats.weeklyBonusAwardedAt,
      updatedUserStats.weeklyWorkoutGoal,
      updatedUserStats.weeklyWorkoutGoalStreak,
    ];

    try {
      const { queryResult } = await this.db.queryV2<UserStats>(query, params);
      return queryResult[0];
    } catch (e) {
      this.logger.error(e, 'Query updateUserStats failed: ');
      throw new DatabaseException(e.message);
    }
  }
}
