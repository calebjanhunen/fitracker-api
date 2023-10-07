import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/model/user.entity';
import { userSeedData } from './user-seed-data';

@Injectable()
export class UserSeederService {
  private usersRepository;

  constructor(@InjectRepository(User) usersRepository: Repository<User>) {
    this.usersRepository = usersRepository;
  }

  async create(): Promise<number | undefined> {
    try {
      let numUsersInserted = 0;
      for (const user of userSeedData) {
        await this.usersRepository.insert(user);
        numUsersInserted++;
      }

      return numUsersInserted;
    } catch (error) {
      throw error;
    }
  }

  async deleteAllUsers(): Promise<void> {
    try {
      await this.usersRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
    } catch (error) {
      throw error;
    }
  }
}
