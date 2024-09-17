import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { InsertUserModel } from '../models/insert-user.model';
import { UserModel } from '../models/user.model';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

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

  public async incrementTotalXp(
    amount: number,
    userId: string,
  ): Promise<number> {
    return this.userRepo.incrementTotalXp(amount, userId);
  }
}
