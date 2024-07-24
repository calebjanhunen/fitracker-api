import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SetType } from 'src/common/enums/set-type.enum';
import { ExerciseRepository } from 'src/modules/exercises/repository/exercise.repository';
import { User } from 'src/modules/user/models/user.entity';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from 'test/utils/integration-environment-setup';
import { Repository } from 'typeorm';
import { WorkoutTemplateExercise } from '../../models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from '../../models/workout-template-set.entity';
import { WorkoutTemplate } from '../../models/workout-template.entity';
import { WorkoutTemplateRepository } from '../workout-template.repository';

describe('WorkoutTemplate Repository: save()', () => {
  let workoutTemplateRepo: WorkoutTemplateRepository;
  let exerciseRepo: ExerciseRepository;
  let userRepo: Repository<User>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await setupTestEnvironment(
      'modules/workout-templates/repository/tests/db-files/testing-save.json',
    );

    workoutTemplateRepo = module.get(WorkoutTemplateRepository);
    exerciseRepo = module.get(ExerciseRepository);
    userRepo = module.get(getRepositoryToken(User));
  });
  afterAll(async () => {
    await teardownTestEnvironment(module);
  });

  it('should be defined', () => {
    expect(workoutTemplateRepo).toBeDefined();
  });

  describe('save()', () => {
    it('should return created workout template on success', async () => {
      const wt = new WorkoutTemplate();
      wt.name = 'Test Template';
      wt.workoutTemplateExercises = [];
      wt.user = await userRepo.findOneByOrFail({
        id: '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8',
      });

      const exercise = await exerciseRepo.getById(
        '3668e2ee-1aaf-4ebe-b5de-9896e6ad3f81',
        '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8',
      );
      if (!exercise) throw new Error('No exercise');
      const wtExercise = new WorkoutTemplateExercise();
      wtExercise.exercise = exercise;
      wtExercise.order = 1;
      wtExercise.sets = [];

      const set = new WorkoutTemplateSet();
      set.order = 1;
      set.type = SetType.WORKING;
      set.workoutTemplateExercise = wtExercise;
      wtExercise.sets.push(set);
      wt.workoutTemplateExercises.push(wtExercise);

      const createdWT = await workoutTemplateRepo.save(wt);
      expect(createdWT).toBeDefined();
      expect(createdWT.workoutTemplateExercises.length).toBe(1);
      expect(createdWT.workoutTemplateExercises[0].exercise.id).toBe(
        '3668e2ee-1aaf-4ebe-b5de-9896e6ad3f81',
      );
      expect(createdWT.user.id).toBe('4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8');
      expect(createdWT.workoutTemplateExercises[0].sets.length).toBe(1);
      expect(
        createdWT.workoutTemplateExercises[0].sets[0].workoutTemplateExercise
          .id,
      ).toBe(createdWT.workoutTemplateExercises[0].id);
    });
  });
});
