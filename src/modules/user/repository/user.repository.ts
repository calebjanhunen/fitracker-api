import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { UserProfileModel } from '../models/user-profile.model';
import { UserStats } from '../models/user-stats.model';

@Injectable()
export class UserRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserRepository.name);
  }

  public async getUserProfile(
    userId: string,
  ): Promise<UserProfileModel | null> {
    const query = `
      SELECT
        up.username,
        up.first_name,
        up.last_name,
        up.weekly_workout_goal,
        us.total_xp,
        us.level,
        us.current_xp,
        r.name as role
      FROM public.user_profile up
      LEFT JOIN public.user_stats us
        ON us.user_id = up.id
      LEFT JOIN auth.user u
        ON u.id = up.id
      LEFT JOIN auth.role r
        ON r.id = u.role
      WHERE up.id = $1
    `;
    const params = [userId];

    try {
      const { queryResult } = await this.db.queryV2<UserProfileModel>(
        query,
        params,
      );

      if (!queryResult.length) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, 'Query getUserProfile failed: ');
      throw new DatabaseException(e);
    }
  }

  public async getStatsByUserId(userId: string): Promise<UserStats> {
    const query = `
      SELECT
        total_xp,
        weekly_workout_goal_achieved_at,
        weekly_workout_goal_streak,
        level,
        current_xp
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
        weekly_workout_goal_achieved_at,
        weekly_workout_goal_streak,
        level,
        current_xp
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
        weekly_workout_goal_achieved_at = $3,
        weekly_workout_goal_streak =  $4,
        level = $5,
        current_xp = $6
      WHERE  user_id = $1
      RETURNING total_xp, weekly_workout_goal_achieved_at
    `;
    const params = [
      userId,
      updatedUserStats.totalXp,
      updatedUserStats.weeklyWorkoutGoalAchievedAt,
      updatedUserStats.weeklyWorkoutGoalStreak,
      updatedUserStats.level,
      updatedUserStats.currentXp,
    ];

    try {
      const { queryResult } = await this.db.queryV2<UserStats>(query, params);
      return queryResult[0];
    } catch (e) {
      this.logger.error(e, 'Query updateUserStats failed: ');
      throw new DatabaseException(e.message);
    }
  }

  public async updateWeeklyWorkoutGoal(
    updatedGoal: number,
    userId: string,
  ): Promise<void> {
    const query = `
      UPDATE user_profile SET
        weekly_workout_goal = $1
      WHERE id = $2
    `;
    const params = [updatedGoal, userId];

    try {
      await this.db.queryV2<UserStats>(query, params);
    } catch (e) {
      this.logger.error(e, 'Query updateWeeklyWorkoutGoal failed: ');
      throw new DatabaseException(e.message);
    }
  }
}
