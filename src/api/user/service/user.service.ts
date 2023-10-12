import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async getById(userId: string): Promise<User> {
    return await this.usersRepository.findOneByOrFail({ id: userId });
  }
}
