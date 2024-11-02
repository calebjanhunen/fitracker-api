import {
  clearDb,
  loadDataIntoTestDb,
} from 'src/../test/integration/init-test-db';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { ExerciseRepository } from '../exercise.repository';

describe('ExerciseRepository: getExerciseDetails', () => {
  let exerciseRepo: ExerciseRepository;

  beforeAll(() => {
    const db = global.dbService;
    const logger = new LoggerServiceV2();
    exerciseRepo = new ExerciseRepository(db, logger);
  });

  beforeEach(async () => {
    await loadDataIntoTestDb(
      'exercise-repository/get_exercise_workout_history.yml',
    );
  });

  afterEach(async () => {
    await clearDb();
  });

  it('it should return exercise details', async () => {
    const response = await exerciseRepo.getExerciseWorkoutHistory(
      'c7cd7efd-d6c2-4e04-a5a9-f2731e845a1d',
      '2a396411-9c45-45e1-92ba-59cffd258ed2',
    );
    console.log(response);
    expect(response.length).toBe(2);
    expect(response[0].name).toBe('Test Workout 2');
    expect(response[0].sets.length).toBe(2);
    expect(response[1].name).toBe('Test Workout 1');
    expect(response[1].sets.length).toBe(3);
  });
});
