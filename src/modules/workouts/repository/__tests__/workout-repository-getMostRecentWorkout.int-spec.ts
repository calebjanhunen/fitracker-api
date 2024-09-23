import {
  clearDb,
  loadDataIntoTestDb,
} from 'src/../test/integration/init-test-db';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { WorkoutRepository } from '../workout.repository';

describe('WorkoutRepository: getMostRecentWorkout', () => {
  let workoutRepo: WorkoutRepository;
  beforeAll(() => {
    const db = global.dbService;
    const logger = new MyLoggerService(WorkoutRepository.name);
    workoutRepo = new WorkoutRepository(db, logger);
  });

  beforeEach(async () => {
    await loadDataIntoTestDb('workout-repository/get-most-recent-workout.yml');
  });

  afterEach(async () => {
    await clearDb();
  });

  it('it should return the most recent workout', async () => {
    const response = await workoutRepo.getMostRecentWorkout(
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
    );
    expect(response).toEqual(new Date('2024-09-23T22:08:04+0000'));
  });
});
