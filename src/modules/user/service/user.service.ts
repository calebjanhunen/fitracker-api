import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { LevelCalculator } from 'src/modules/workouts/calculator';
import { UserProfileModel } from '../models/user-profile.model';
import { UserStats } from '../models/user-stats.model';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
    private readonly levelCalculator: LevelCalculator,
  ) {
    this.logger.setContext(UserService.name);
  }

  public async getCurrentUser(userId: string): Promise<UserProfileModel> {
    const user = await this.userRepo.getUserProfile(userId);
    if (!user) {
      throw new ResourceNotFoundException('User not found');
    }

    const getXpNeededForCurrentLevel =
      this.levelCalculator.getXpNeededForCurrentLevel(user.level);
    user.xpNeededForCurrentLevel = getXpNeededForCurrentLevel;
    return user;
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

  public async updateWeeklyWorkoutGoal(
    weeklyWorkoutGoal: number,
    userId: string,
  ): Promise<UserProfileModel> {
    await this.userRepo.updateWeeklyWorkoutGoal(weeklyWorkoutGoal, userId);
    const user = await this.userRepo.getUserProfile(userId);
    if (!user) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  private getUpdatedUserStatsModel(
    updatedUserStats: UserStats,
    currentUserStats: UserStats,
  ): UserStats {
    const newUserStats = new UserStats();
    newUserStats.totalXp = updatedUserStats.totalXp ?? currentUserStats.totalXp;
    newUserStats.weeklyWorkoutGoalAchievedAt =
      updatedUserStats.weeklyWorkoutGoalAchievedAt ??
      currentUserStats.weeklyWorkoutGoalAchievedAt;
    newUserStats.weeklyWorkoutGoalStreak =
      updatedUserStats.weeklyWorkoutGoalStreak ??
      currentUserStats.weeklyWorkoutGoalStreak;
    newUserStats.level = updatedUserStats.level ?? currentUserStats.level;
    newUserStats.currentXp =
      updatedUserStats.currentXp ?? currentUserStats.currentXp;

    return newUserStats;
  }
}
