import { Inject, Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { InsertUserModel } from '../models/insert-user.model';
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

  public async incrementTotalXp(
    amount: number,
    userId: string,
  ): Promise<number> {
    const queryName = 'IncrementTotalXp';
    const query = `
      UPDATE user_stats
      SET total_xp = total_xp + $1
      WHERE user_id = $2
      RETURNING total_xp
    `;
    const params = [amount, userId];

    try {
      const { queryResult, elapsedTime } = await this.db.queryV2<{
        totalXp: number;
      }>(query, params);

      this.logger.log(`Query ${queryName} took ${elapsedTime}ms`);

      return queryResult[0].totalXp;
    } catch (e) {
      this.logger.error(`Query ${queryName} failed: `, e);
      throw e;
    }
  }
}
