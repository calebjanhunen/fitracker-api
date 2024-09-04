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
      const result = await this.db.query<UserModel>(
        'CreateUser',
        query,
        values,
      );

      return UserModel.fromDbQuery(result.rows[0]);
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
      const result = await this.db.query<UserModel>(
        'FindUserByUsername',
        query,
        values,
      );

      if (result.rows.length === 0) {
        return null;
      }
      return UserModel.fromDbQuery(result.rows[0]);
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
      const result = await this.db.query<UserModel>(
        'FindUserByEmail',
        query,
        values,
      );

      if (result.rows.length === 0) {
        return null;
      }
      return UserModel.fromDbQuery(result.rows[0]);
    } catch (e) {
      throw e;
    }
  }
}