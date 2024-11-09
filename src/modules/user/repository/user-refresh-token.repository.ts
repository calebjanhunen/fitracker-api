import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';

@Injectable()
export class UserRefreshTokenReposistory {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerServiceV2,
  ) {
    this.logger.setContext(UserRefreshTokenReposistory.name);
  }

  public async upsertRefreshToken(
    userId: string,
    refreshToken: string,
    deviceId: string,
  ): Promise<void> {
    const query = `
      INSERT INTO user_refresh_token (user_id, refresh_token, device_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, device_id)
      DO UPDATE SET
        refresh_token = EXCLUDED.refresh_token,
        device_id = EXCLUDED.device_id,
        created_at = NOW()
    `;
    const params = [userId, refreshToken, deviceId];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      this.logger.error('Query insertRefreshToken failed: ', e);
      throw e;
    }
  }

  public async getRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<string | null> {
    const query = `
      SELECT 
        refresh_token
      FROM user_refresh_token
      WHERE user_id = $1 AND
        device_id = $2
    `;
    const params = [userId, deviceId];

    try {
      const { queryResult } = await this.db.queryV2<{ refreshToken: string }>(
        query,
        params,
      );

      if (!queryResult.length) {
        return null;
      }

      return queryResult[0].refreshToken;
    } catch (e) {
      this.logger.error('Query getRefreshToken failed: ', e);
      throw e;
    }
  }

  public async deleteRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const query = `
      DELETE FROM user_refresh_token
      WHERE user_id = $1 AND
        device_id = $2
    `;
    const params = [userId, deviceId];

    try {
      await this.db.queryV2(query, params);
    } catch (e) {
      this.logger.error('Query deleteRefreshToken failed: ', e);
      throw e;
    }
  }
}
