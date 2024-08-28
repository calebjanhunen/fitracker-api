import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DB_CONNECTION } from 'src/database/constants';
import { UserModel } from '../models/user.model';

@Injectable()
export class UserRepository {
  constructor(@Inject(DB_CONNECTION) private readonly db: Pool) {}

  public async create(user: UserModel): Promise<UserModel> {
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
      const result = await this.db.query<UserModel>(query, values);
      return result.rows[0];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
