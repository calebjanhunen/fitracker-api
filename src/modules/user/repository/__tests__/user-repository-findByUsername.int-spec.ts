import { Test, TestingModule } from '@nestjs/testing';
import { DB_CONNECTION } from 'src/database/constants';
import { UserRepository } from '../user.repository';

describe('UserRepository: findById()', () => {
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

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (username, password, first_name, last_name, email)
        VALUES 
          ('test_user1', 'password1', 'Test', 'User1', 'test1@example.com')
      `);
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should successfully return a user', async () => {
    const user = await userRepository.findByUsername('test_user1');
    expect(user?.username).toBe('test_user1');
    expect(user?.firstName).toBe('Test');
  });
  it('should return null', async () => {
    const user = await userRepository.findByUsername('non-existent-user');
    expect(user).toBeNull();
  });
});
