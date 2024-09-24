import { Inject, Injectable } from '@nestjs/common';

import { BaseException } from 'src/common/internal-exceptions/base.exception';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { XpCannotBeBelowZeroException } from '../internal-exceptions/xp-cannot-be-below-zero.exceptions';
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

  public async decrementTotalXp(
    amount: number,
    userId: string,
  ): Promise<number> {
    const user = await this.findById(userId);

    if (user.totalXp - amount < 0) {
      this.logger.warn(
        `User tried removing ${amount} xp from total xp: ${user.totalXp}`,
      );
      throw new XpCannotBeBelowZeroException();
    }

    try {
      return await this.userRepo.decrementTotalXp(amount, userId);
    } catch (e) {
      throw new BaseException('Could not decrement xp: ' + e.message);
    }
  }

  public async updateStatsAfterWorkoutCreation(
    lastWorkoutDate: Date,
    currentWorkoutStreak: number,
    gainedXp: number,
    userId: string,
  ): Promise<number> {
    return this.userRepo.updateStatsAfterWorkoutCreation(
      lastWorkoutDate,
      currentWorkoutStreak,
      gainedXp,
      userId,
    );
  }

  public async getStatsByUserId(userId: string): Promise<UserStats> {
    return this.userRepo.getStatsByUserId(userId);
  }
}
