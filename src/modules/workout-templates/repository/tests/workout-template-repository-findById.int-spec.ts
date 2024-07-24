import { Test, TestingModule } from '@nestjs/testing';
import {
  clearDatabase,
  loadDataFromJsonIntoDb,
} from 'src/scripts/load-data-into-test-db';
import { integrationDataSource } from 'test/integration/integration-test-datasource';
import { IntegrationTestModule } from 'test/integration/jest-integration.module';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from 'test/utils/integration-environment-setup';
import { DataSource } from 'typeorm';
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
});
