import { Injectable } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { TotalXpLeaderboardUser } from './models';

@Injectable()
export class LeaderboardService {
  constructor(private readonly leaderboardRepo: LeaderboardRepository) {}

  public async getTotalXpLeaderboard(): Promise<TotalXpLeaderboardUser[]> {
    return this.leaderboardRepo.getTotalXpLeaderboard();
  }
}
