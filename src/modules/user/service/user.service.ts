import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { UserStats } from '../models/user-stats.model';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserService.name);
  }

  public async getStatsByUserId(userId: string): Promise<UserStats> {
    return this.userRepo.getStatsByUserId(userId);
  }

  public async updateUserStats(
    userId: string,
    updatedUserStats: UserStats,
  ): Promise<UserStats> {
    const userStats = await this.userRepo.getStatsByUserId(userId);
    if (!userStats) {
      throw new ResourceNotFoundException(
        `User stats for user ${userId} not found.`,
      );
    }
    const newUserStats = this.getUpdatedUserStatsModel(
      updatedUserStats,
      userStats,
    );
    return await this.userRepo.updateUserStats(newUserStats, userId);
  }

  private getUpdatedUserStatsModel(
    updatedUserStats: UserStats,
    currentUserStats: UserStats,
  ): UserStats {
    const newUserStats = new UserStats();
    newUserStats.totalXp = updatedUserStats.totalXp ?? currentUserStats.totalXp;
    newUserStats.weeklyBonusAwardedAt =
      updatedUserStats.weeklyBonusAwardedAt ??
      currentUserStats.weeklyBonusAwardedAt;
    newUserStats.weeklyWorkoutGoalStreak =
      updatedUserStats.weeklyWorkoutGoalStreak ??
      currentUserStats.weeklyWorkoutGoalStreak;

    return newUserStats;
  }
}
