import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { InsertUserModel } from '../../models/insert-user.model';
import { UserRepository } from '../user.repository';

describe('UserRepository: create()', () => {
  const pool = global.getDbPool();
  let userRepository: UserRepository;

  beforeAll(async () => {
    const logger = new LoggerServiceV2();
    userRepository = new UserRepository(global.dbService, logger);
  });

  afterEach(async () => {
    await pool.query('DELETE FROM "user" WHERE username = \'test_user1\'');
  });

  it('should successfully create user', async () => {
    const userModel = new InsertUserModel();
    userModel.username = 'test_user1';
    userModel.password = '123';
    userModel.firstName = 'test';
    userModel.lastName = 'user';
    userModel.email = 'test@test.com';
    const user = await userRepository.create(userModel);
    expect(user.email).toBe('test@test.com');
    expect(user.username).toBe('test_user1');
    expect(user.firstName).toBe('test');
    expect(user.lastName).toBe('user');
  });
});
