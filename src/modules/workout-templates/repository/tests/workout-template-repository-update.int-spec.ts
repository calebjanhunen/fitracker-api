import { TestingModule } from '@nestjs/testing';
import { SetType } from 'src/common/enums/set-type.enum';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from 'test/utils/integration-environment-setup';
import { WorkoutTemplateSet } from '../../models/workout-template-set.entity';
import { WorkoutTemplateRepository } from '../workout-template.repository';

describe('WorkoutTemplate Repository: save()', () => {
  let workoutTemplateRepo: WorkoutTemplateRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await setupTestEnvironment(
      'modules/workout-templates/repository/tests/db-files/testing-update.json',
    );

    workoutTemplateRepo = module.get(WorkoutTemplateRepository);
  });
  afterAll(async () => {
    await teardownTestEnvironment(module);
  });

  it('should be defined', () => {
    expect(workoutTemplateRepo).toBeDefined();
  });

  describe('save()', () => {
    it('should return created workout template on success', async () => {
      const workoutTemplate = await workoutTemplateRepo.findById(
        '81622181-0768-45e1-943f-86099cd91961',
        '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8',
      );
      if (!workoutTemplate) return;

      const setToAdd = new WorkoutTemplateSet();
      setToAdd.order = 1;
      setToAdd.type = SetType.WARMUP;
      setToAdd.workoutTemplateExercise =
        workoutTemplate.workoutTemplateExercises[0];
      workoutTemplate.workoutTemplateExercises[0].sets = [
        ...workoutTemplate.workoutTemplateExercises[0].sets,
        setToAdd,
      ];
      await workoutTemplateRepo.update(workoutTemplate);

      const newWorkoutTemplate = await workoutTemplateRepo.findById(
        '81622181-0768-45e1-943f-86099cd91961',
        '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8',
      );

      expect(newWorkoutTemplate?.workoutTemplateExercises[0].sets.length).toBe(
        2,
      );
    });
  });
});
