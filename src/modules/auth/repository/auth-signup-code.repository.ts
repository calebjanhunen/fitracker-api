import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';

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
}
