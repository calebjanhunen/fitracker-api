import { Test, TestingModule } from '@nestjs/testing';
import { SetType } from 'src/common/enums/set-type.enum';
import { SkillLevel } from 'src/modules/auth/enums/skill-level';
import { ExerciseDifficultyLevel } from 'src/modules/exercises/enums/exercise-difficulty-level';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { ExerciseRepository } from 'src/modules/exercises/repository/exercise.repository';
import { User } from 'src/modules/user/models/user.entity';
import { UserService } from 'src/modules/user/service/user.service';
import { IntegrationTestModule } from 'test/integration/jest-integration.module';
import { WorkoutTemplateExercise } from '../../models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from '../../models/workout-template-set.entity';
import { WorkoutTemplate } from '../../models/workout-template.entity';
import { WorkoutTemplateRepository } from '../workout-template.repository';

describe('WorkoutTemplate Repository Integration Tests', () => {
  let workoutTemplateRepo: WorkoutTemplateRepository;
  let userService: UserService;
  let exerciseRepo: ExerciseRepository;
  let user: User;
  let exercise: Exercise;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [IntegrationTestModule],
    }).compile();

    workoutTemplateRepo = module.get(WorkoutTemplateRepository);
    userService = module.get(UserService);
    exerciseRepo = module.get(ExerciseRepository);
  });

  it('should be defined', () => {
    expect(workoutTemplateRepo).toBeDefined();
    expect(userService).toBeDefined();
    expect(exerciseRepo).toBeDefined();
  });

  it('should create user', async () => {
    const entity = new User();
    entity.username = 'testuser';
    entity.firstName = 'Test';
    entity.lastName = 'User';
    entity.password = '123';
    entity.skillLevel = SkillLevel.advanced;
    entity.email = 'testuser@test.com';
    user = await userService.createUser(entity);
  });
  it('should create exercise', async () => {
    const entity = new Exercise();
    entity.name = 'Test Exercise';
    entity.equipment = 'dumbbells';
    entity.instructions = ['step 1', 'step 2'];
    entity.isCustom = false;
    entity.primaryMuscle = 'chest';
    entity.difficultyLevel = ExerciseDifficultyLevel.beginner;
    exercise = await exerciseRepo.create(entity);
  });

  describe('save()', () => {
    it('should return created workout template on success', async () => {
      const wt = new WorkoutTemplate();
      wt.name = 'Test Template';
      wt.workoutTemplateExercises = [];
      wt.user = user;

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
      console.log(createdWT.workoutTemplateExercises[0].sets[0]);
      expect(createdWT).toBeDefined();
      expect(createdWT.workoutTemplateExercises.length).toBe(1);
      expect(createdWT.workoutTemplateExercises[0].exercise.id).toBe(
        exercise.id,
      );
      expect(createdWT.user.id).toBe(user.id);
      expect(createdWT.workoutTemplateExercises[0].sets.length).toBe(1);
      expect(
        createdWT.workoutTemplateExercises[0].sets[0].workoutTemplateExercise
          .id,
      ).toBe(createdWT.workoutTemplateExercises[0].id);
    });
  });
});
