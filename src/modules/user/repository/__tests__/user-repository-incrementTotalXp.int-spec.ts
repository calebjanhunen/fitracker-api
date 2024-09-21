import { MyLoggerService } from 'src/common/logger/logger.service';
import { UserRepository } from '../user.repository';

describe('UserRepository: incrementTotalXp', () => {
  const pool = global.getDbPool();
  let userRepository: UserRepository;

  beforeAll(async () => {
    const logger = new MyLoggerService(UserRepository.name);
    userRepository = new UserRepository(global.dbService, logger);
  });

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (id, username, password, first_name, last_name, email)
        VALUES 
          ('a4b517f0-184d-43c4-8f61-a3dfde729450', 'test_user1', 'password1', 'Test', 'User1', 'test1@example.com')
      `);

    await pool.query(`
        INSERT INTO user_stats (user_id, total_xp)
        VALUES ('a4b517f0-184d-43c4-8f61-a3dfde729450', 1235)
      `);
  });

  afterEach(async () => {
    await pool.query('DELETE FROM "user" WHERE username = \'test_user1\'');
  });

  it('should increment total_xp by the given amount', async () => {
    const amount = 10;
    const userId = 'a4b517f0-184d-43c4-8f61-a3dfde729450';

    const result = await userRepository.incrementTotalXp(amount, userId);

    expect(result).toBe(1245);
  });
});
