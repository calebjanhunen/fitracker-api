import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { SignupCodeModel } from '../models/signup-code.model';

@Injectable()
export class AuthSignupCodeRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerServiceV2,
  ) {
    this.logger.setContext(AuthSignupCodeRepository.name);
  }

  public async upsertSignupCode(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<void> {
    const query = `
        INSERT INTO auth_signup_code (email, code, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (email)
        DO UPDATE SET
          code = EXCLUDED.code,
          expires_at = EXCLUDED.expires_at,
          created_at = NOW()
    `;
    const params = [email, code, expiresAt];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      this.logger.error('Query insertSignupCode failed:', e);
      throw new DatabaseException(e.message);
    }
  }

  public async getSignupCode(
    code: string,
    email: string,
  ): Promise<SignupCodeModel | null> {
    const query = `
      SELECT
        id,
        email,
        code,
        created_at,
        expires_at,
        used_at
      FROM auth_signup_code
      WHERE email = $1
        AND code = $2
    `;
    const params = [email, code];

    try {
      const { queryResult } = await this.db.queryV2<SignupCodeModel>(
        query,
        params,
      );

      if (!queryResult[0]) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error('Query getSignupCode failed: ', e);
      throw new DatabaseException(e);
    }
  }

  public async getSignupCodeByEmail(
    email: string,
  ): Promise<SignupCodeModel | null> {
    const query = `
      SELECT
        id,
        email,
        code,
        created_at,
        expires_at,
        used_at
      FROM auth_signup_code
      WHERE email = $1
        AND used_at IS NULL
    `;
    const params = [email];

    try {
      const { queryResult } = await this.db.queryV2<SignupCodeModel>(
        query,
        params,
      );

      if (!queryResult[0]) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error('Query getSignupCode failed: ', e);
      throw new DatabaseException(e);
    }
  }

  public async setSignupCodeAsUsed(id: number) {
    const query = `
      UPDATE auth_signup_code
      SET
        used_at = NOW()
      WHERE id = $1
    `;
    const params = [id];

    try {
      await this.db.queryV2<SignupCodeModel>(query, params);
    } catch (e) {
      this.logger.error('Query setSignupCodeAsUsed failed: ', e);
      throw new DatabaseException(e);
    }
  }
}
