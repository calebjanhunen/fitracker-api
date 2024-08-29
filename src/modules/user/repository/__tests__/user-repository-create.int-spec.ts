import { Test, TestingModule } from '@nestjs/testing';
import { DB_CONNECTION } from 'src/database/constants';
import { InsertUserModel } from '../../models/insert-user.model';
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
    const userModel = new InsertUserModel(
      'test_user',
      '123',
      'test',
      'user',
      'test@test.com',
    );
    const user = await userRepository.create(userModel);
    expect(user.email).toBe('test@test.com');
    expect(user.username).toBe('test_user');
    expect(user.firstName).toBe('test');
    expect(user.lastName).toBe('user');
  });
});
