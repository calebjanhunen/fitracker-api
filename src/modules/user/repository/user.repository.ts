import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { InsertUserModel } from '../models/insert-user.model';
import { UserModel } from '../models/user.model';

@Injectable()
export class UserRepository {
  constructor(private readonly db: DbService) {}

  public async create(user: InsertUserModel): Promise<UserModel> {
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
      const result = await this.db.queryV2<UserModel>(
        'CreateUser',
        query,
        values,
      );

      return result[0];
    } catch (e) {
      throw e;
    }
  }

  public async findByUsername(username: string): Promise<UserModel | null> {
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
      const result = await this.db.queryV2<UserModel>(
        'FindUserByUsername',
        query,
        values,
      );

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (e) {
      throw e;
    }
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
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
      const result = await this.db.queryV2<UserModel>(
        'FindUserByEmail',
        query,
        values,
      );

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (e) {
      throw e;
    }
  }

  public async findById(id: string): Promise<UserModel | null> {
    const query = `
    SELECT
      id,
      username,
      first_name,
      last_name,
      total_xp
    FROM "user"
    WHERE id = $1
`;
    const values = [id];

    try {
      const result = await this.db.queryV2<UserModel>(
        'FindUserById',
        query,
        values,
      );

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (e) {
      throw e;
    }
  }

  public async incrementTotalXp(
    amount: number,
    userId: string,
  ): Promise<number> {
    const query = `
      UPDATE "user"
      SET total_xp = total_xp + $1
      WHERE id = $2
      RETURNING total_xp
    `;
    const params = [amount, userId];

    try {
      const response = await this.db.queryV2<{ totalXp: number }>(
        'IncrementTotalXp',
        query,
        params,
      );

      return response[0].totalXp;
    } catch (e) {
      throw e;
    }
  }
}
