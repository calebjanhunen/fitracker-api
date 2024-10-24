import {
  clearDb,
  loadDataIntoTestDb,
} from 'src/../test/integration/init-test-db';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { ExerciseRepository } from '../exercise.repository';

describe('ExerciseRepository: getExerciseDetails', () => {
  let exerciseRepo: ExerciseRepository;

  beforeAll(() => {
    const db = global.dbService;
    const logger = new MyLoggerService(ExerciseRepository.name);
    exerciseRepo = new ExerciseRepository(db, logger);
  });

  beforeEach(async () => {
    await loadDataIntoTestDb('exercise-repository/get_exercise_details.yml');
  });

  afterEach(async () => {
    await clearDb();
  });

  it('it should return exercise details', async () => {
    const response = await exerciseRepo.getExerciseDetails(
      'c7cd7efd-d6c2-4e04-a5a9-f2731e845a1d',
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
    );

    expect(response?.name).toBe('Test Exercise');
    expect(response?.workoutDetails.length).toBe(2);
    expect(response?.workoutDetails[0].workoutName).toBe('Test Workout 2');
    expect(response?.workoutDetails[0].sets.length).toBe(2);
    expect(response?.workoutDetails[1].workoutName).toBe('Test Workout 1');
    expect(response?.workoutDetails[1].sets.length).toBe(3);
  });
});
