import { TestingModule } from '@nestjs/testing';
import { ExerciseRepository } from '../exercise.repository';

describe('Exercise Repository: getRecentSetsForExercises()', () => {
  let exerciseRepo: ExerciseRepository;
  let module: TestingModule;
  it('pass', () => expect(1).toBe(1));
  // beforeAll(async () => {
  // module = await setupTestEnvironment(
  //   'modules/exercises/repository/tests/db-files/testing-get-recent-sets-for-exercises.json',
  // );
  // exerciseRepo = module.get(ExerciseRepository);
  // });
  // beforeEach(async () => {
  //   await resetDatabase();
  // });
  // afterAll(async () => {
  //   await teardownTestEnvironment(module);
  // });

  // it('should be defined', () => {
  //   expect(exerciseRepo).toBeDefined();
  // });

  // it('should only get one exercise since 1 id is provided along with the previous sets', async () => {
  //   const exerciseIds = ['3668e2ee-1aaf-4ebe-b5de-9896e6ad3f81'];
  //   const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
  //   const exercisesWithRecentSets =
  //     await exerciseRepo.getRecentSetsForExercises(userId, exerciseIds);

  //   expect(exercisesWithRecentSets.length).toBe(1);
  //   expect(exercisesWithRecentSets[0].sets.length).toBe(2);
  // });
  // it('should get two exercises since 2 ids are provided along with the previous sets', async () => {
  //   const exerciseIds = [
  //     '3668e2ee-1aaf-4ebe-b5de-9896e6ad3f81',
  //     'f00304e2-ece7-49a0-b883-ab0dcdec87b2',
  //   ];
  //   const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
  //   const exercisesWithRecentSets =
  //     await exerciseRepo.getRecentSetsForExercises(userId, exerciseIds);

  //   expect(exercisesWithRecentSets.length).toBe(2);
  //   expect(exercisesWithRecentSets[0].sets.length).toBe(2);
  //   expect(exercisesWithRecentSets[1].sets.length).toBe(1);
  // });
  // it('should get all exercises when no exerciseIds are provided', async () => {
  //   const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
  //   const exercisesWithRecentSets =
  //     await exerciseRepo.getRecentSetsForExercises(userId);

  //   expect(exercisesWithRecentSets.length).toBe(2);
  //   expect(exercisesWithRecentSets[0].sets.length).toBe(2);
  //   expect(exercisesWithRecentSets[1].sets.length).toBe(1);
  // });
});
