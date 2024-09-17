import { UserRepository } from '../user.repository';

describe('UserRepository: incrementTotalXp', () => {
  const pool = global.getDbPool();
  let userRepository: UserRepository;

  beforeAll(async () => {
    userRepository = new UserRepository(global.dbService);
  });

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (id, username, password, first_name, last_name, email, total_xp)
        VALUES 
          ('a4b517f0-184d-43c4-8f61-a3dfde729450', 'test_user1', 'password1', 'Test', 'User1', 'test1@example.com', 123215)
      `);
  });

  afterEach(async () => {
    await pool.query('DELETE FROM "user" WHERE username = \'test_user1\'');
  });

  it('should increment total_xp by the given amount', async () => {
    const amount = 10;
    const userId = 'a4b517f0-184d-43c4-8f61-a3dfde729450';

    await userRepository.incrementTotalXp(amount, userId);

    const result = await pool.query(
      `SELECT total_xp FROM "user" WHERE id = 'a4b517f0-184d-43c4-8f61-a3dfde729450'`,
    );

    expect(result.rows[0]['total_xp']).toBe(123225);
  });
});
