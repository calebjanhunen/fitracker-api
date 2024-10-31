import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { UserRepository } from '../user.repository';

describe('UserRepository: findById()', () => {
  const pool = global.getDbPool();
  let userRepository: UserRepository;

  beforeAll(async () => {
    const logger = new LoggerServiceV2();
    userRepository = new UserRepository(global.dbService, logger);
  });

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (username, password, first_name, last_name, email)
        VALUES 
          ('test_user1', 'password1', 'Test', 'User1', 'test1@example.com')
      `);
  });

  afterEach(async () => {
    await pool.query('DELETE FROM "user" WHERE username = \'test_user1\'');
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
