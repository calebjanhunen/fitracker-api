import { Test, TestingModule } from '@nestjs/testing';
import { DB_CONNECTION } from 'src/database/constants';
import { UserModel } from '../../models/user.model';
import { UserRepository } from '../user.repository';

describe('UserRepository: create()', () => {
  const pool = global.getDbPool();
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DB_CONNECTION,
          useValue: pool,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should successfully create user', async () => {
    const userModel = new UserModel();
    userModel.email = '22';
    const user = await userRepository.create(userModel);
    console.log(user);
    expect(user).toBeDefined();
  });
});
