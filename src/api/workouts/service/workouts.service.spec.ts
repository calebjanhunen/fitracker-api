import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exercise, Set, User, Workout } from 'src/model';
import { Repository } from 'typeorm';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  let workoutsService: WorkoutsService;
  let mockWorkoutRepo: Repository<Workout>;
  const workoutRepoToken = getRepositoryToken(Workout);

  const mockWorkout: Workout = {
    id: crypto.randomUUID(),
    name: 'Mock Workout',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: new User(),
    exercises: [new Exercise(), new Exercise()],
    sets: [new Set(), new Set()],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        {
          provide: workoutRepoToken,
          useClass: Repository,
        },
      ],
    }).compile();

    workoutsService = module.get<WorkoutsService>(WorkoutsService);
    mockWorkoutRepo = module.get<Repository<Workout>>(workoutRepoToken);
  });

  it('should be defined', () => {
    expect(workoutsService).toBeDefined();
    expect(mockWorkoutRepo).toBeDefined();
  });

  describe('test createWorkout()', () => {
    const mockReturnedWorkout: Workout = {
      id: crypto.randomUUID(),
      name: 'Mock Workout',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: new User(),
      exercises: [new Exercise(), new Exercise()],
      sets: [],
    };

    test('it should successfully create the workout', async () => {
      jest.spyOn(mockWorkoutRepo, 'create').mockReturnValue(mockWorkout);
      await workoutsService.createWorkout(mockWorkout);
    });
  });

  describe('test getWorkouts()', () => {
    test('it should successfully return a list of workouts', async () => {
      // jest.spyOn();
    });
  });
});
