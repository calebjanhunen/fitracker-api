import { TestingModule } from '@nestjs/testing';
import { getIntegrationDataSourceInstance } from 'test/integration/integration-test-datasource';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from 'test/utils/integration-environment-setup';
import { DataSource } from 'typeorm';
import { WorkoutTemplateRepository } from '../workout-template.repository';

describe('WorkoutTemplate Repository: delete()', () => {
  let workoutTemplateRepo: WorkoutTemplateRepository;
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await setupTestEnvironment(
      'modules/workout-templates/repository/tests/db-files/testing-delete.json',
    );

    workoutTemplateRepo = module.get(WorkoutTemplateRepository);
    dataSource = await getIntegrationDataSourceInstance();
  });
  afterAll(async () => {
    await teardownTestEnvironment(module);
  });

  it('should be defined', () => {
    expect(workoutTemplateRepo).toBeDefined();
  });

  it('should delete workout template and related entries in workout_template_exercise and workout_template_sets', async () => {
    const workoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const workoutTemplateExerciseId = '81622181-0768-45e1-943f-86099cd91961';

    const workoutTemplateToDelete = await workoutTemplateRepo.findById(
      workoutTemplateId,
      userId,
    );
    if (!workoutTemplateToDelete) return;

    await workoutTemplateRepo.delete(workoutTemplateToDelete);

    const deletedWorkoutTemplate = await workoutTemplateRepo.findById(
      workoutTemplateId,
      userId,
    );
    const deletedWorkoutTemplateExercises = await dataSource.query(
      `SELECT * FROM workout_template_exercise WHERE workout_template_id = $1`,
      [workoutTemplateId],
    );
    const deletedWorkoutTemplateSets = await dataSource.query(
      `SELECT * FROM workout_template_sets WHERE workout_template_exercise_id = $1`,
      [workoutTemplateExerciseId],
    );

    expect(deletedWorkoutTemplate).toBeNull();
    expect(deletedWorkoutTemplateExercises.length).toBe(0);
    expect(deletedWorkoutTemplateSets.length).toBe(0);
  });
});
