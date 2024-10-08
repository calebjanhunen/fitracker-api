import {
  clearDb,
  loadDataIntoTestDb,
} from 'src/../test/integration/init-test-db';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { InsertWorkoutModel } from '../../models';
import { WorkoutRepository } from '../workout.repository';

describe('UserRepository: getStatsByUserId', () => {
  let workoutRepo: WorkoutRepository;

  beforeAll(() => {
    const db = global.dbService;
    const logger = new MyLoggerService(WorkoutRepository.name);
    workoutRepo = new WorkoutRepository(db, logger);
  });

  beforeEach(async () => {
    await loadDataIntoTestDb('workout-repository/find_workouts_where.yml');
  });

  afterEach(async () => {
    await clearDb();
  });

  describe('test getting workouts created on the same day', () => {
    it('should return the workout created on the same day', async () => {
      const workout = new InsertWorkoutModel();
      workout.createdAt = new Date('2024-10-08T14:21:35.123Z');

      const result = await workoutRepo.findWorkoutsWhere(
        '2a396411-9c45-45e1-92ba-59cffd258ed2',
        [
          {
            field: `DATE(w.created_at)`,
            operator: '=',
            value: workout.createdAt.toLocaleDateString(),
          },
        ],
      );

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Test Workout 1');
    });
    it('should return empty array if no workouts were created on the same day', async () => {
      const workout = new InsertWorkoutModel();
      workout.createdAt = new Date('2024-10-09T14:21:35.123Z');

      const result = await workoutRepo.findWorkoutsWhere(
        '2a396411-9c45-45e1-92ba-59cffd258ed2',
        [
          {
            field: `DATE(w.created_at)`,
            operator: '=',
            value: workout.createdAt.toLocaleDateString(),
          },
        ],
      );

      expect(result.length).toBe(0);
    });
  });
});
