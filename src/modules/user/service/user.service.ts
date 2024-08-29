import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { InsertUserModel } from '../models/insert-user.model';
import { User } from '../models/user.entity';
import { UserModel } from '../models/user.model';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  private usersRepository: Repository<User>;

  constructor(
    @InjectRepository(User) usersRepository: Repository<User>,
    private readonly userRepo: UserRepository,
  ) {
    this.usersRepository = usersRepository;
  }

  public async create(user: InsertUserModel): Promise<UserModel> {
    return this.userRepo.create(user);
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    return this.userRepo.findByUsername(username);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * Gets user by id
   *
   * @param {string} userId
   * @returns {User}
   *
   * @throws {EntityNotFoundError}
   */
  async getById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new ResourceNotFoundException('User not found');
    return user;
  }
}
