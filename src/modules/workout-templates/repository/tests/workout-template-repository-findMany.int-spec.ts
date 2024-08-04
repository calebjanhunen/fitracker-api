import { TestingModule } from '@nestjs/testing';
import {
  resetDatabase,
  setupTestEnvironment,
  teardownTestEnvironment,
} from 'test/utils/integration-environment-setup';
import { WorkoutTemplateRepository } from '../workout-template.repository';

describe('WorkoutTemplate Repository: findById()', () => {
  let workoutTemplateRepo: WorkoutTemplateRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await setupTestEnvironment(
      'modules/workout-templates/repository/tests/db-files/testing-find-many.json',
    );
    workoutTemplateRepo = module.get(WorkoutTemplateRepository);
  });
  beforeEach(async () => {
    await resetDatabase();
  });
  afterAll(async () => {
    await teardownTestEnvironment(module);
  });

  it('should be defined', () => {
    expect(workoutTemplateRepo).toBeDefined();
  });

  it('should return workout template array', async () => {
    const workoutTemplates = await workoutTemplateRepo.findMany(
      '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8',
    );
    expect(workoutTemplates.length).toBe(2);
  });
  it('should be empty array if no workout templates exist for user', async () => {
    const workoutTemplates = await workoutTemplateRepo.findMany(
      '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e2',
    );
    expect(workoutTemplates.length).toBe(0);
  });
});
