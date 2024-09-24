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

  it('it should return the most recent workout', async () => {
    const response = await userRepo.getStatsByUserId(
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
    );
    expect(response.lastWorkoutDate).toEqual(
      new Date('2024-09-23T23:41:40+0000'),
    );
    expect(response.totalXp).toBe(12345);
    expect(response.currentWorkoutStreak).toBe(5);
  });
});
