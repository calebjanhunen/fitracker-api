import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { InsertUserModel } from '../models/insert-user.model';
import { UserModel } from '../models/user.model';

@Injectable()
export class UserRepository {
  private COLUMNS_AND_JOINS = `
        id,
        username,
        password,
        email,
        is_verified
    FROM auth.user
    `;
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserRepository.name);
  }

  public async createUser(user: InsertUserModel): Promise<UserModel> {
    let queryName = 'CreateUser';
    const query = `
          INSERT INTO auth.user (username, password, email, is_verified)
          VALUES ($1, $2, $3, true)
          RETURNING *;
      `;
    const values = [user.username, user.password, user.email];

    try {
      const { queryResult } = await this.db.queryV2<UserModel>(query, values);

      queryName = 'InsertUserProfile';
      const userProfileQuery = `
        INSERT INTO public.user_profile (id, first_name, last_name, weekly_workout_goal)
        VALUES ($1, $2, $3, 0)
      `;
      const userProfileParams = [
        queryResult[0].id,
        user.firstName,
        user.lastName,
      ];
      await this.db.queryV2(userProfileQuery, userProfileParams);

      queryName = 'InsertUserStats';
      const userStatsQuery = `
          INSERT INTO public.user_stats
          VALUES ($1, 0)
        `;
      const userStatsParams = [queryResult[0].id];
      await this.db.queryV2(userStatsQuery, userStatsParams);

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `);
      throw new DatabaseException(e);
    }
  }

  public async getUserById(userId: string): Promise<UserModel | null> {
    const queryName = 'GetUserById';
    const query = `
      SELECT
       ${this.COLUMNS_AND_JOINS}
      WHERE id = $1
    `;
    const values = [userId];

    try {
      const { queryResult } = await this.db.queryV2<UserModel>(query, values);

      if (queryResult.length === 0) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `);
      throw new DatabaseException(e);
    }
  }

  public async getUserByUsername(username: string): Promise<UserModel | null> {
    const queryName = 'getUserByUsername';

    const query = `
          SELECT
            ${this.COLUMNS_AND_JOINS}
          WHERE username = $1
      `;
    const values = [username];

    try {
      const { queryResult } = await this.db.queryV2<UserModel>(query, values);

      if (queryResult.length === 0) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }

  public async getUserByEmail(email: string): Promise<UserModel | null> {
    const queryName = 'getUserByEmail';
    const query = `
      SELECT
        ${this.COLUMNS_AND_JOINS}
      WHERE email = $1
  `;
    const values = [email];

    try {
      const { queryResult } = await this.db.queryV2<UserModel>(query, values);

      if (queryResult.length === 0) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }

  public async resetPassword(userId: string, password: string): Promise<void> {
    const queryName = 'updatePassword';
    const query = `
      UPDATE auth.user
      SET
        password = $1,
        updated_at = NOW()
      WHERE id = $2
    `;
    const params = [password, userId];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }
}
