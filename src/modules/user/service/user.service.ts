import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { InsertUserModel } from '../models/insert-user.model';
import { UserStats } from '../models/user-stats.model';
import { UserModel } from '../models/user.model';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerServiceV2,
  ) {
    this.logger.setContext(UserService.name);
  }

  public async create(user: InsertUserModel): Promise<UserModel> {
    return this.userRepo.create(user);
  }

  public async findByUsername(username: string): Promise<UserModel | null> {
    return this.userRepo.findByUsername(username);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userRepo.findByEmail(email);
  }

  async findById(id: string): Promise<UserModel> {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new ResourceNotFoundException('User not found');
    }

    return user;
  }

  public async getStatsByUserId(userId: string): Promise<UserStats> {
    return this.userRepo.getStatsByUserId(userId);
  }

  public async verifyUser(email: string): Promise<void> {
    this.userRepo.verifyUserByEmail(email);
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

  public async resetPassword(userId: string, password: string): Promise<void> {
    this.userRepo.resetPassword(userId, password);
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
    newUserStats.weeklyWorkoutGoal =
      updatedUserStats.weeklyWorkoutGoal ?? currentUserStats.weeklyWorkoutGoal;
    newUserStats.weeklyWorkoutGoalStreak =
      updatedUserStats.weeklyWorkoutGoalStreak ??
      currentUserStats.weeklyWorkoutGoalStreak;

    return newUserStats;
  }
}
