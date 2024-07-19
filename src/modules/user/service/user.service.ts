import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { User } from '../../../model/user.entity';

@Injectable()
export class UserService {
  private usersRepository: Repository<User>;

  constructor(@InjectRepository(User) usersRepository: Repository<User>) {
    this.usersRepository = usersRepository;
  }

  async getByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({
        where: { username },
      });

      return user;
    } catch (error) {
      throw error;
    }
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
