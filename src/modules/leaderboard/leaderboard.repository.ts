import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { LoggerService } from 'src/common/logger/logger.service';
import { TotalXpLeaderboardUser } from './models/total-xp-leaderboard-user.model';

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
            up.total_xp
        FROM public.user_profile
    `;
  }
}
