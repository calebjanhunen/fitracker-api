import {
  clearDb,
  loadDataIntoTestDb,
} from 'src/../test/integration/init-test-db';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { UserRepository } from '../user.repository';

describe('UserRepository: getStatsByUserId', () => {
  let userRepo: UserRepository;

  beforeAll(() => {
    const db = global.dbService;
    const logger = new MyLoggerService(UserRepository.name);
    userRepo = new UserRepository(db, logger);
  });

  beforeEach(async () => {
    await loadDataIntoTestDb('user-repository/get_stats_by_user_id.yml');
  });

  afterEach(async () => {
    await clearDb();
  });

  it('it should return user stats', async () => {
    const response = await userRepo.getStatsByUserId(
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
    );
    expect(response.totalXp).toBe(12345);
    expect(response.weeklyBonusAwardedAt.toISOString().split('T')[0]).toBe(
      '2024-10-08',
    );
  });
});
