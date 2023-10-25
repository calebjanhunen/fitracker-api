import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exercise, Set, User, Workout } from 'src/model';
import { EntityNotFoundError, Repository } from 'typeorm';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  let workoutsService: WorkoutsService;
  let mockWorkoutRepo: Repository<Workout>;
  let mockSetRepo: Repository<Set>;
  const workoutRepoToken = getRepositoryToken(Workout);
  const setRepoToken = getRepositoryToken(Set);

  const mockWorkout1: Workout = {
    id: 'workout-id-1',
    name: 'Workout 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: new User(),
    exercises: [new Exercise(), new Exercise()],
    sets: [new Set(), new Set()],
  };
  const mockWorkout2: Workout = {
    id: 'workout-id-2',
    name: 'Workout 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: new User(),
    exercises: [new Exercise(), new Exercise()],
    sets: [new Set(), new Set()],
  };
  const mockWorkouts: Workout[] = [mockWorkout1, mockWorkout2];
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
      jest.spyOn(mockWorkoutRepo, 'save').mockResolvedValue(mockWorkout1);
      jest.spyOn(mockSetRepo, 'save').mockResolvedValue(mockWorkout1.sets[0]);

      const result = await workoutsService.createWorkout(mockWorkout1);

      expect(result).toBe(mockWorkout1.id);
      expect(mockWorkoutRepo.save).toHaveBeenCalledWith(mockWorkout1);
      expect(mockSetRepo.save).toHaveBeenCalledWith(mockWorkout1.sets);
    });
  });

  describe('test getWorkouts()', () => {
    it('should successfully return a list of workouts', async () => {
      jest.spyOn(mockWorkoutRepo, 'find').mockResolvedValue(mockWorkouts);

      jest.spyOn(mockSetRepo, 'find').mockResolvedValueOnce([new Set()]);
      jest.spyOn(mockSetRepo, 'find').mockResolvedValueOnce([new Set()]);

      const result = await workoutsService.getWorkouts(mockUser);

      expect(result).toStrictEqual(mockWorkouts);
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

  describe('test getWorkoutById()', () => {
    it('should successfully return a workout', async () => {
      jest
        .spyOn(mockWorkoutRepo, 'findOneOrFail')
        .mockResolvedValue(mockWorkout1);

      const result = await workoutsService.getWorkoutById(
        'workout-id',
        'user-id',
      );

      expect(result).toStrictEqual(mockWorkout1);
    });

    it('should throw EntityNotFoundError if workout does not exist', async () => {
      jest
        .spyOn(mockWorkoutRepo, 'findOneOrFail')
        .mockRejectedValue(new EntityNotFoundError(Workout, '?'));

      expect(
        async () =>
          await workoutsService.getWorkoutById('workout-id', 'user-id'),
      ).rejects.toThrow(EntityNotFoundError);
    });
  });
});
