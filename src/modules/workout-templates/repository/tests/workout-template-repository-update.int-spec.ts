import { TestingModule } from '@nestjs/testing';
import { SetType } from 'src/common/enums/set-type.enum';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import {
  resetDatabase,
  setupTestEnvironment,
  teardownTestEnvironment,
} from 'test/utils/integration-environment-setup';
import { WorkoutTemplateExercise } from '../../models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from '../../models/workout-template-set.entity';
import { WorkoutTemplateRepository } from '../workout-template.repository';

describe('WorkoutTemplate Repository: update()', () => {
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

  beforeEach(async () => {
    await resetDatabase();
  });

  it('should be defined', () => {
    expect(workoutTemplateRepo).toBeDefined();
  });

  it('should update workout template name and return updated workout template', async () => {
    const existingWorkoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const existingWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    const newWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate || !newWorkoutTemplate) return;

    newWorkoutTemplate.name = 'Test Workout Template NEW';

    const updatedWT = await workoutTemplateRepo.update(
      newWorkoutTemplate,
      existingWorkoutTemplate,
      userId,
    );
    if (!updatedWT) return;

    expect(updatedWT.name).toBe('Test Workout Template NEW');
  });
  it('should add new workout template exercise to workout template and return updated workout template', async () => {
    const existingWorkoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const existingWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    const newWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate || !newWorkoutTemplate) return;

    // New workout template exercise
    const newWorkoutTemplateExercise = new WorkoutTemplateExercise();
    newWorkoutTemplateExercise.exercise = new Exercise();
    newWorkoutTemplateExercise.exercise.id =
      'fe1dce22-e402-4752-922a-c31eacefbe46';
    newWorkoutTemplateExercise.order = 3;
    newWorkoutTemplateExercise.workoutTemplate = newWorkoutTemplate;
    newWorkoutTemplateExercise.sets = [];

    // new set for workout template exercise
    const newSet = new WorkoutTemplateSet();
    newSet.order = 1;
    newSet.type = SetType.WORKING;
    newSet.workoutTemplateExercise = newWorkoutTemplateExercise;

    newWorkoutTemplateExercise.sets.push(newSet);
    newWorkoutTemplate.workoutTemplateExercises.push(
      newWorkoutTemplateExercise,
    );

    const updatedWT = await workoutTemplateRepo.update(
      newWorkoutTemplate,
      existingWorkoutTemplate,
      userId,
    );
    if (!updatedWT) return -1;

    expect(updatedWT.workoutTemplateExercises.length).toBe(3);
    expect(updatedWT.workoutTemplateExercises[2].exercise.id).toBe(
      'fe1dce22-e402-4752-922a-c31eacefbe46',
    );
    expect(updatedWT.workoutTemplateExercises[2].sets.length).toBe(1);
  });
  it('should update an already existing exercise in the workout template', async () => {
    const existingWorkoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const existingWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    const newWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate || !newWorkoutTemplate) return;

    newWorkoutTemplate.workoutTemplateExercises[0].order = 2;
    newWorkoutTemplate.workoutTemplateExercises[1].order = 1;

    const updatedWT = await workoutTemplateRepo.update(
      newWorkoutTemplate,
      existingWorkoutTemplate,
      userId,
    );
    expect(
      updatedWT?.workoutTemplateExercises.find(
        (e) => e.id === '37eb6e1e-c26e-46e3-8732-e8874a1d2df1',
      )?.order,
    ).toBe(2);
    expect(
      updatedWT?.workoutTemplateExercises.find(
        (e) => e.id === 'c2d89d2e-1ff5-4992-82b8-2bbccdbeeb78',
      )?.order,
    ).toBe(1);
  });
  it('should add new set to existing exercise', async () => {
    const existingWorkoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const existingWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    const newWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate || !newWorkoutTemplate) return;

    const newSet = new WorkoutTemplateSet();
    newSet.order = 2;
    newSet.type = SetType.WORKING;
    newSet.workoutTemplateExercise =
      newWorkoutTemplate.workoutTemplateExercises[0];
    newWorkoutTemplate.workoutTemplateExercises[0].sets.push(newSet);

    const updatedWT = await workoutTemplateRepo.update(
      newWorkoutTemplate,
      existingWorkoutTemplate,
      userId,
    );

    expect(updatedWT?.workoutTemplateExercises[0].sets.length).toBe(2);
  });
  it('should update an already existing set', async () => {
    const existingWorkoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const existingWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    const newWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate || !newWorkoutTemplate) return;

    newWorkoutTemplate.workoutTemplateExercises[0].sets[0].type =
      SetType.WARMUP;

    const updatedWT = await workoutTemplateRepo.update(
      newWorkoutTemplate,
      existingWorkoutTemplate,
      userId,
    );

    expect(updatedWT?.workoutTemplateExercises[0].sets[0].type).toBe(
      SetType.WARMUP,
    );
  });
  it('should remove workout template exercise from workout template if not in new workout template', async () => {
    const existingWorkoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const existingWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    const newWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate || !newWorkoutTemplate) return;

    newWorkoutTemplate.workoutTemplateExercises =
      existingWorkoutTemplate.workoutTemplateExercises.filter(
        (e) => e.id !== 'c2d89d2e-1ff5-4992-82b8-2bbccdbeeb78',
      );

    const updatedWT = await workoutTemplateRepo.update(
      newWorkoutTemplate,
      existingWorkoutTemplate,
      userId,
    );

    expect(updatedWT?.workoutTemplateExercises.length).toBe(1);
  });
  it('should remove workout template set from workout template exercise if not in new workout template exercise', async () => {
    const existingWorkoutTemplateId = '81622181-0768-45e1-943f-86099cd91961';
    const userId = '4e06c1c0-a0d6-4f0c-be74-4eb8678a70e8';
    const existingWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    const newWorkoutTemplate = await workoutTemplateRepo.findById(
      existingWorkoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate || !newWorkoutTemplate) return;

    newWorkoutTemplate.workoutTemplateExercises[1].sets =
      newWorkoutTemplate.workoutTemplateExercises[1].sets.filter(
        (set) => set.id !== '05ff5432-24a9-4775-8805-fbfa529092a5',
      );

    const updatedWT = await workoutTemplateRepo.update(
      newWorkoutTemplate,
      existingWorkoutTemplate,
      userId,
    );

    expect(updatedWT?.workoutTemplateExercises[1].sets.length).toBe(1);
  });
});
