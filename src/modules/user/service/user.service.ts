import { Injectable } from '@nestjs/common';

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
}
