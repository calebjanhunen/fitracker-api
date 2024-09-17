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

  public async incrementTotalXp(amount: number, userId: string): Promise<void> {
    const query = `
      UPDATE "user"
      SET total_xp = total_xp + $1
      WHERE id = $2
    `;
    const params = [amount, userId];

    try {
      await this.db.queryV2('IncrementTotalXp', query, params);
    } catch (e) {
      throw e;
    }
  }
}
