import { TestingModule } from '@nestjs/testing';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from 'test/utils/integration-environment-setup';
import { WorkoutTemplateRepository } from '../workout-template.repository';

describe('findById()', () => {
  let workoutTemplateRepo: WorkoutTemplateRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await setupTestEnvironment(
      'modules/workout-templates/repository/tests/db-files/testing-find-by-id.json',
    );
    workoutTemplateRepo = module.get(WorkoutTemplateRepository);
  });

  afterAll(async () => {
    await teardownTestEnvironment(module);
  });

  it('should be defined', () => {
    expect(workoutTemplateRepo).toBeDefined();
  });

  it('should return workout template object', async () => {
    const workoutTemplate = await workoutTemplateRepo.findById(
      '81622181-0768-45e1-943f-86099cd91961',
      '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8',
    );
    expect(workoutTemplate?.id).toBe('81622181-0768-45e1-943f-86099cd91961');
    expect(workoutTemplate?.workoutTemplateExercises.length).toBe(1);
    expect(workoutTemplate?.workoutTemplateExercises[0].sets.length).toBe(1);
  });
  it('should be null if workout template with id does not exist', async () => {
    const nonExistentId = '7c91be23-18d1-4bc9-ab5f-4a2359d316b7';
    const workoutTemplate = await workoutTemplateRepo.findById(
      nonExistentId,
      '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8',
    );
    expect(workoutTemplate).toBeNull();
  });
  it('should be null if workout template exists but does not belong to user', async () => {
    const workoutTemplate = await workoutTemplateRepo.findById(
      '81622181-0768-45e1-943f-86099cd91961',
      'f9610720-0b25-4e1f-8d09-714b5ffaef4b',
    );
    expect(workoutTemplate).toBeNull();
  });
});
