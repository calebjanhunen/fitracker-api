import { Inject, Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { InsertUserModel } from '../models/insert-user.model';
import { UserStats } from '../models/user-stats.model';
import { UserModel } from '../models/user.model';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    @Inject('UserServiceLogger') private readonly logger: MyLoggerService,
  ) {}

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
    newUserStats.weeklyWorkoutGoal =
      updatedUserStats.weeklyWorkoutGoal ?? currentUserStats.weeklyWorkoutGoal;
    newUserStats.weeklyWorkoutGoalStreak =
      updatedUserStats.weeklyWorkoutGoalStreak ??
      currentUserStats.weeklyWorkoutGoalStreak;

    return newUserStats;
  }
}
