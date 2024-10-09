import {
  clearDb,
  loadDataIntoTestDb,
} from 'src/../test/integration/init-test-db';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { WorkoutRepository } from '../workout.repository';

describe('UserRepository: getStatsByUserId', () => {
  let workoutRepo: WorkoutRepository;

  beforeAll(() => {
    const db = global.dbService;
    const logger = new MyLoggerService(WorkoutRepository.name);
    workoutRepo = new WorkoutRepository(db, logger);
  });

  beforeEach(async () => {
    await loadDataIntoTestDb('workout-repository/find_workouts_this_week.yml');
  });

  afterEach(async () => {
    await clearDb();
  });

  it('should return 1 workout', async () => {
    const now = new Date('2024-10-08T21:48:07.031Z');

    const result = await workoutRepo.findWorkoutsThisWeekWithDistinctDates(
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
      now,
    );

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Test Workout 2');
  });
  it('getting workouts on a day with 2 workouts on that day should not return those workouts', async () => {
    const now = new Date('2024-10-09T21:48:07.031Z');

    const result = await workoutRepo.findWorkoutsThisWeekWithDistinctDates(
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
      now,
    );
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Test Workout 2');
  });
  it('getting workouts where a previous day in the week has more than 1 workout should just return 1 of them', async () => {
    const now = new Date('2024-10-10T21:48:07.031Z');

    const result = await workoutRepo.findWorkoutsThisWeekWithDistinctDates(
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
      now,
    );

    expect(result.length).toBe(2);
  });
});
