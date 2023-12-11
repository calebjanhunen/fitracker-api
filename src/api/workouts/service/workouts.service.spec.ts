import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/common/business-exceptions/resource-not-found.exception';
import { Exercise, Set, User, Workout } from 'src/model';
import { DeleteResult, Repository } from 'typeorm';
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
      jest.spyOn(mockWorkoutRepo, 'findOne').mockResolvedValue(mockWorkout1);

      const result = await workoutsService.getById('workout-id', 'user-id');

      expect(result).toStrictEqual(mockWorkout1);
    });

    it('should throw ResourceNotFoundError if workout does not exist', async () => {
      jest.spyOn(mockWorkoutRepo, 'findOne').mockResolvedValue(null);

      expect(
        async () => await workoutsService.getById('workout-id', 'user-id'),
      ).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('test deleteById()', () => {
    it('should successfully delete workout', async () => {
      const model = getWorkoutModel();
      const deleteResult = new DeleteResult();
      deleteResult.affected = 1;
      jest.spyOn(workoutsService, 'getById').mockResolvedValue(model);
      jest.spyOn(mockWorkoutRepo, 'delete').mockResolvedValue(deleteResult);

      await workoutsService.deleteById(model.id, 'user-id');

      expect(mockWorkoutRepo.delete).toHaveBeenCalledWith({
        id: model.id,
        user: { id: 'user-id' },
      });
      expect(mockWorkoutRepo.delete).toReturn();
    });
    it('should throw ResourceNotFoundException if user in request does not match the user that owns the workout', async () => {
      jest
        .spyOn(workoutsService, 'getById')
        .mockRejectedValue(new ResourceNotFoundException('Workout not found'));

      expect(
        async () => await workoutsService.deleteById('workout-id', 'user-id'),
      ).rejects.toThrow(ResourceNotFoundException);
    });
  });
});

function getWorkoutModel(): Workout {
  const model: Workout = {
    id: 'workout-id',
    name: 'Workout',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: new User(),
    exercises: [new Exercise(), new Exercise()],
    sets: [new Set(), new Set()],
  };

  return model;
}
