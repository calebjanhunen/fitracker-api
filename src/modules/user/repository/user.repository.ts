import { Inject, Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { InsertUserModel } from '../models/insert-user.model';
import { UserStats } from '../models/user-stats.model';
import { UserModel } from '../models/user.model';

@Injectable()
export class UserRepository {
  constructor(
    private readonly db: DbService,
    @Inject('UserRepoLogger') private readonly logger: MyLoggerService,
  ) {}

  public async create(user: InsertUserModel): Promise<UserModel> {
    const queryName = 'CreateUser';
    const query = `
        INSERT INTO "user" (username, password, first_name, last_name, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [
      user.username,
      user.password,
      user.firstName,
      user.lastName,
      user.email,
    ];
    try {
      const { queryResult, elapsedTime } = await this.db.queryV2<UserModel>(
        query,
        values,
      );

      const userStatsQuery = `
        INSERT INTO user_stats
        VALUES ($1, 0)
      `;
      const userStatsParams = [queryResult[0].id];
      await this.db.queryV2(userStatsQuery, userStatsParams);

      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);
      return queryResult[0];
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  public async findByUsername(username: string): Promise<UserModel | null> {
    const queryName = 'FindUserByUsername';
    const query = `
        SELECT
          id,
          username,
          password,
          email,
          first_name,
          last_name
        FROM "user"
        WHERE username = $1
    `;
    const values = [username];

    try {
      const { queryResult, elapsedTime } = await this.db.queryV2<UserModel>(
        query,
        values,
      );

      if (queryResult.length === 0) {
        return null;
      }
      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);

      return queryResult[0];
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    const queryName = 'FindUserByEmail';
    const query = `
    SELECT
      id,
      username,
      email,
      first_name,
      last_name
    FROM "user"
    WHERE email = $1
`;
    const values = [email];

    try {
      const { queryResult, elapsedTime } = await this.db.queryV2<UserModel>(
        query,
        values,
      );

      if (queryResult.length === 0) {
        return null;
      }
      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);

      return queryResult[0];
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }

  public async findById(id: string): Promise<UserModel | null> {
    const queryName = 'FindUserById';
    const query = `
    SELECT
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      us.total_xp
    FROM "user" as u
    INNER JOIN user_stats us ON us.user_id = u.id
    WHERE u.id = $1
`;
    const values = [id];

    try {
      const { queryResult, elapsedTime } = await this.db.queryV2<UserModel>(
        query,
        values,
      );

      if (queryResult.length === 0) {
        return null;
      }
      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);

      return queryResult[0];
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
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
      this.logger.error('Query GetStatsByUserId failed: ', e);
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
      this.logger.error('Query updateUserStats failed: ', e);
      throw new DatabaseException(e.message);
    }
  }
}
