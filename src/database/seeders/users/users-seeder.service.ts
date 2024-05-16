import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/model/user.entity';
import { generateHashPassword } from 'src/modules/auth/helpers/password-helper';
import { userSeedData } from './user-seed-data';

@Injectable()
export class UserSeederService {
  private usersRepository;

  constructor(@InjectRepository(User) usersRepository: Repository<User>) {
    this.usersRepository = usersRepository;
  }

  async create(): Promise<string[]> {
    const createdUserIds: string[] = [];
    try {
      for (const user of userSeedData) {
        const hashedPwd = await generateHashPassword(user.password);

        const createdUser = await this.usersRepository
          .createQueryBuilder()
          .insert()
          .values({ ...user, password: hashedPwd })
          .returning('id')
          .execute();
        createdUserIds.push(createdUser.generatedMaps[0].id);
      }

      return createdUserIds;
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
