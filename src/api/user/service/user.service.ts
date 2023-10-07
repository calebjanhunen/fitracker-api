import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../model/user.entity';
import UserSignupDto from '../../auth/dto/user-signup-dto';

@Injectable()
export class UserService {
  private usersRepository;

  constructor(@InjectRepository(User) usersRepository: Repository<User>) {
    this.usersRepository = usersRepository;
  }

  async create(user: UserSignupDto): Promise<User> {
    try {
      const newUser = this.usersRepository.create(user);
      await this.usersRepository.save(newUser);

      return newUser;
    } catch (error) {
      throw error;
    }
  }
}
