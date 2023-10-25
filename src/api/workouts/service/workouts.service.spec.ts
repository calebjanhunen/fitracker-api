import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exercise, Set, User, Workout } from 'src/model';
import { Repository } from 'typeorm';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  let workoutsService: WorkoutsService;
  let mockWorkoutRepo: Repository<Workout>;
  let mockSetRepo: Repository<Set>;
  const workoutRepoToken = getRepositoryToken(Workout);
  const setRepoToken = getRepositoryToken(Set);

  const mockWorkout: Workout = {
    id: crypto.randomUUID(),
    name: 'Mock Workout',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: new User(),
    exercises: [new Exercise(), new Exercise()],
    sets: [new Set(), new Set()],
  };
  const mockUser: User = { ...new User(), id: 'test-user-id' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        {
          provide: workoutRepoToken,
          useClass: Repository,
        },
        {
          provide: setRepoToken,
          useClass: Repository,
        },
      ],
    }).compile();

    workoutsService = module.get<WorkoutsService>(WorkoutsService);
    mockWorkoutRepo = module.get<Repository<Workout>>(workoutRepoToken);
    mockSetRepo = module.get<Repository<Set>>(setRepoToken);
  });

  it('should be defined', () => {
    expect(workoutsService).toBeDefined();
    expect(mockWorkoutRepo).toBeDefined();
  });

  describe('test createWorkout()', () => {
    it('should successfully create the workout', async () => {
      jest.spyOn(mockWorkoutRepo, 'save').mockResolvedValue(mockWorkout);
      jest.spyOn(mockSetRepo, 'save').mockResolvedValue(mockWorkout.sets[0]);

      const result = await workoutsService.createWorkout(mockWorkout);

      expect(result).toBe(mockWorkout.id);
      expect(mockWorkoutRepo.save).toHaveBeenCalledWith(mockWorkout);
      expect(mockSetRepo.save).toHaveBeenCalledWith(mockWorkout.sets);
    });
  });

  describe('test getWorkouts()', () => {
    const mockReturnedWorkoutFromFindCall: Workout[] = [
      {
        id: 'workout-id-1',
        name: 'Mock Workout 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: new User(),
        exercises: [new Exercise(), new Exercise()],
        sets: [],
      },
      {
        id: 'workout-id-2',
        name: 'Mock Workout 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: new User(),
        exercises: [new Exercise(), new Exercise()],
        sets: [],
      },
    ];

    it('should successfully return a list of workouts', async () => {
      jest
        .spyOn(mockWorkoutRepo, 'find')
        .mockResolvedValue(mockReturnedWorkoutFromFindCall);

      jest.spyOn(mockSetRepo, 'find').mockResolvedValueOnce([new Set()]);
      jest.spyOn(mockSetRepo, 'find').mockResolvedValueOnce([new Set()]);

      const result = await workoutsService.getWorkouts(mockUser);

      expect(result).toStrictEqual(mockReturnedWorkoutFromFindCall);
      expect(mockWorkoutRepo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        select: { exercises: { id: true, name: true } },
        relations: { exercises: true },
      });
      expect(mockSetRepo.find).toHaveBeenCalledWith({
        where: { workout: { id: 'workout-id-1' } },
        select: { exercise: { id: true } },
        relations: { exercise: true },
      });
      expect(mockSetRepo.find).toHaveBeenCalledWith({
        where: { workout: { id: 'workout-id-2' } },
        select: { exercise: { id: true } },
        relations: { exercise: true },
      });
    });
  });
});
