import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../models/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepo: Repository<User>;

  const userRepoToken = getRepositoryToken(User);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: userRepoToken,
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(userRepoToken);
  });
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('test findByUsername()', () => {
    it('Getting a user that does not exist should return false', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);

      const result = await userService.getByUsername('test@example.com');

      expect(result).toBe(null);
    });

    it('Getting a user that does exist should return true', async () => {
      jest
        .spyOn(userRepo, 'findOne')
        .mockResolvedValueOnce({ username: 'test' } as User);

      const result = await userService.getByUsername('test@example.com');

      expect(result).toStrictEqual({ username: 'test' });
    });
  });
});
