import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../model/user.entity';

@Injectable()
export class UserService {
  private usersRepository;

  constructor(@InjectRepository(User) usersRepository: Repository<User>) {
    this.usersRepository = usersRepository;
  }

  async checkIfUserAlreadyExists(username: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({
        where: { username },
      });

      return !!user;
    } catch (error) {
      throw error;
    }
  }
}
