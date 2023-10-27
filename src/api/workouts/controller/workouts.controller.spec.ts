import { ImATeapotException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/api/user/service/user.service';
import { UserNotFoundException } from 'src/api/utils/exceptions/user-not-found.exception';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Exercise, Set, User, Workout } from 'src/model';
import { EntityNotFoundError } from 'typeorm';
import { CreateWorkoutAdapter } from '../adapter/create-workout.adapter';
import { WorkoutResponseAdapter } from '../adapter/workout-response.adapter';
import { CreateWorkoutRequest } from '../request/create-workout.request';
import { WorkoutResponse } from '../response/workout.response';
import { WorkoutsService } from '../service/workouts.service';
import { CouldNotCreateWorkoutException } from './exceptions/could-not-create-workout.exception';
import { CouldNotFindWorkoutException } from './exceptions/could-not-find-workout.exception';
import { WorkoutsController } from './workouts.controller';

describe('WorkoutsController', () => {
  let workoutsController: WorkoutsController;
  let mockWorkoutsService: WorkoutsService;
  let mockUserService: UserService;
  let mockWorkoutResponseAdapter: WorkoutResponseAdapter;

  const testWorkoutModel: Workout = {
    id: 'workout-id',
    name: 'Test Workout',
    user: new User(),
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: [
      { ...new Exercise(), id: 'test-exercise', name: 'Test Exercise' },
    ],
    sets: [
      { ...new Set(), exercise: { ...new Exercise(), id: 'test-exercise' } },
    ],
  };

  const testWorkoutResponse: WorkoutResponse = {
    id: 'workout-id',
    name: 'Test Workout',
    dateCreated: new Date(),
    exercises: [
      {
        ...new Exercise(),
        id: 'test-exercise',
        name: 'Test Exercise',
        sets: [new Set()],
      },
    ],
  };
  const testUser: User = { ...new User(), id: 'test-user' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutsController],
      providers: [
        AuthGuard,
        JwtService,
        CreateWorkoutAdapter,
        WorkoutResponseAdapter,
        {
          provide: WorkoutsService,
          useValue: {
            createWorkout: jest.fn(),
            getWorkouts: jest.fn(),
            getById: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    workoutsController = module.get<WorkoutsController>(WorkoutsController);
    mockWorkoutsService = module.get<WorkoutsService>(WorkoutsService);
    mockUserService = module.get<UserService>(UserService);
    mockWorkoutResponseAdapter = module.get<WorkoutResponseAdapter>(
      WorkoutResponseAdapter,
    );
  });

  it('should be defined', () => {
    expect(workoutsController).toBeDefined();
    expect(mockWorkoutsService).toBeDefined();
    expect(mockUserService).toBeDefined();
    expect(mockWorkoutResponseAdapter).toBeDefined();
  });

  describe('test createWorkout()', () => {
    it('should return workout when it successfully creates workout', async () => {
      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockResolvedValue('created-workout-id');
      jest
        .spyOn(mockWorkoutsService, 'getById')
        .mockResolvedValue(testWorkoutModel);
      jest
        .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
        .mockReturnValue(testWorkoutResponse);

      const response = await workoutsController.create(
        new CreateWorkoutRequest(),
        'test-user',
      );

      expect(response).toStrictEqual(testWorkoutResponse);
    });
    it('should throw CouldNotCreateWorkoutException if workout creation fails', () => {
      jest.spyOn(mockWorkoutsService, 'createWorkout').mockRejectedValue(Error);

      expect(
        async () =>
          await workoutsController.create(
            new CreateWorkoutRequest(),
            'test-user',
          ),
      ).rejects.toThrow(CouldNotCreateWorkoutException);
    });
    it('should throw CouldNotCreateWorkoutException if workout could not be found', () => {
      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockResolvedValue('created-workout-id');
      jest
        .spyOn(mockWorkoutsService, 'getById')
        .mockRejectedValue(EntityNotFoundError);

      expect(
        async () =>
          await workoutsController.create(
            new CreateWorkoutRequest(),
            'test-user',
          ),
      ).rejects.toThrow(CouldNotCreateWorkoutException);
    });
  });

  describe('test getWorkouts()', () => {
    it('should return a list of workouts', async () => {
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(testUser);
      jest
        .spyOn(mockWorkoutsService, 'getWorkouts')
        .mockResolvedValue([testWorkoutModel]);
      jest
        .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
        .mockReturnValue(testWorkoutResponse);

      const result = await workoutsController.getWorkouts(testUser.id);

      expect(result).toStrictEqual([testWorkoutResponse]);
    });

    it('should throw NotFoundException if user is not found', () => {
      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(new ImATeapotException());

      expect(mockUserService.getById).rejects.toThrow(ImATeapotException);
      expect(
        async () => await workoutsController.getWorkouts(testUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('test getSingleWorkout()', () => {
    it('should successfully return workout', async () => {
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(testUser);
      jest
        .spyOn(mockWorkoutsService, 'getById')
        .mockResolvedValue(testWorkoutModel);
      jest
        .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
        .mockReturnValue(testWorkoutResponse);

      const response = await workoutsController.getSingleWorkout('test-user', {
        id: 'test-workout-id',
      });

      expect(response).toStrictEqual(testWorkoutResponse);
    });
    it('should throw UserNotFoundException when user is not found', () => {
      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(new UserNotFoundException());

      expect(
        async () =>
          await workoutsController.getSingleWorkout('test-user', {
            id: 'test-workout-id',
          }),
      ).rejects.toThrow(UserNotFoundException);
    });
    it('should throw CouldNotFindWorkoutException if workout is not found', () => {
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(testUser);
      jest
        .spyOn(mockWorkoutsService, 'getById')
        .mockRejectedValue(new CouldNotFindWorkoutException());

      expect(
        async () =>
          await workoutsController.getSingleWorkout('test-user', {
            id: 'test-workout-id',
          }),
      ).rejects.toThrow(CouldNotFindWorkoutException);
    });
  });
});
