import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { EmailVerificationCodeModel } from '../models/email-verification-code.model';

@Injectable()
export class EmailVerificationCodeRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(EmailVerificationCodeRepository.name);
  }

  public async upsertEmailVerificationCode(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<void> {
    const query = `
        INSERT INTO auth.email_verification_code (email, code, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (email)
        DO UPDATE SET
          used_at = NULL,
          code = EXCLUDED.code,
          expires_at = EXCLUDED.expires_at,
          created_at = NOW()
    `;
    const params = [email, code, expiresAt];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      this.logger.error(e, 'Query insertEmailVerificationCode failed:');
      throw new DatabaseException(e.message);
    }
  }

  public async getEmailVerificationCode(
    code: string,
    email: string,
  ): Promise<EmailVerificationCodeModel | null> {
    const query = `
      SELECT
        id,
        email,
        code,
        created_at,
        expires_at,
        used_at
      FROM auth.email_verification_code
      WHERE email = $1
        AND code = $2
    `;
    const params = [email, code];

    try {
      const { queryResult } = await this.db.queryV2<EmailVerificationCodeModel>(
        query,
        params,
      );

      if (!queryResult[0]) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, 'Query getEmailVerificationCode failed: ');
      throw new DatabaseException(e);
    }
  }

  public async getEmailVerificationCodeByEmail(
    email: string,
  ): Promise<EmailVerificationCodeModel | null> {
    const query = `
      SELECT
        id,
        email,
        code,
        created_at,
        expires_at,
        used_at
      FROM auth.email_verification_code
      WHERE email = $1
    `;
    const params = [email];

    try {
      const { queryResult } = await this.db.queryV2<EmailVerificationCodeModel>(
        query,
        params,
      );

      if (!queryResult[0]) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, 'Query getEmailVerificationCode failed: ');
      throw new DatabaseException(e);
    }
  }

  public async setEmailVerificationCodeAsUsed(id: number) {
    const query = `
      UPDATE auth.email_verification_code
      SET
        used_at = NOW()
      WHERE id = $1
    `;
    const params = [id];

    try {
      await this.db.queryV2<EmailVerificationCodeModel>(query, params);
    } catch (e) {
      this.logger.error(e, 'Query setEmailVerificationCodeAsUsed failed: ');
      throw new DatabaseException(e);
    }
  }
}
