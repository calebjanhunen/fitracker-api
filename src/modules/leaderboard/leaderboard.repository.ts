import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { TotalXpLeaderboardUser } from './models';

@Injectable()
export class LeaderboardRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {}

  public async getTotalXpLeaderboard(): Promise<TotalXpLeaderboardUser[]> {
    const queryName = 'getTotalXpLeaderboard';
    const query = `
      SELECT
          up.username,
          us.total_xp
      FROM
          public.user_profile up
          LEFT JOIN public.user_stats us ON us.user_id = up.id
      ORDER BY
          us.total_xp DESC
    `;

    try {
      const { queryResult } = await this.db.queryV2<TotalXpLeaderboardUser>(
        query,
        [],
      );
      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed`, { queryName });
      throw new DatabaseException(e);
    }
  }
}
