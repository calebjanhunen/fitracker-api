import { UserRepository } from '../user.repository';

describe('UserRepository: findByEmail()', () => {
  const pool = global.getDbPool();
  let userRepository: UserRepository;

  beforeAll(async () => {
    userRepository = new UserRepository(global.dbService);
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
    const user = await userRepository.findByEmail('test1@example.com');
    expect(user?.username).toBe('test_user1');
    expect(user?.firstName).toBe('Test');
  });
  it('should return null', async () => {
    const user = await userRepository.findByEmail('non-existent-user');
    expect(user).toBeNull();
  });
});
