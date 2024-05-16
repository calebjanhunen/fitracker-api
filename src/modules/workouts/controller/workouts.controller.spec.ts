import {
  ConflictException,
  ForbiddenException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceNotFoundException } from 'src/common/business-exceptions/resource-not-found.exception';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserNotFoundException } from 'src/common/http-exceptions/user-not-found.exception';
import { Exercise, Set, User, Workout } from 'src/model';
import { ExerciseDoesNotBelongToUser } from 'src/modules/exercises/services/exceptions/exercise-does-not-belong-to-user.exception';
import { ExerciseNotFoundException } from 'src/modules/exercises/services/exceptions/exercise-not-found.exception';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutAdapter } from '../adapter/create-workout.adapter';
import { WorkoutResponseAdapter } from '../adapter/workout-response.adapter';
import { CreateWorkoutRequest } from '../request/create-workout.request';
import { WorkoutResponse } from '../response/workout.response';
import { CouldNotSaveSetException } from '../service/exceptions/could-not-save-set.exception';
import { CouldNotSaveWorkoutException } from '../service/exceptions/could-not-save-workout.exception';
import { WorkoutNotFoundException } from '../service/exceptions/workout-not-found.exception';
import { WorkoutsService } from '../service/workouts.service';
import { CouldNotFindWorkoutException } from './exceptions/could-not-find-workout.exception';
import { WorkoutsController } from './workouts.controller';

describe('WorkoutsController', () => {
  let workoutsController: WorkoutsController;
  let mockWorkoutsService: WorkoutsService;
  let mockUserService: UserService;
  let mockWorkoutResponseAdapter: WorkoutResponseAdapter;

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
            deleteById: jest.fn(),
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
      const user = new User();
      const workoutModel = getWorkoutModelWithExercisesAndSets(user);
      const workoutResponse = getWorkoutResponse(workoutModel);
      const createWorkoutRequest = new CreateWorkoutRequest();

      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockResolvedValue(workoutModel);
      jest
        .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
        .mockReturnValue(workoutResponse);

      const response = await workoutsController.create(
        createWorkoutRequest,
        'test-user',
      );

      expect(response).toStrictEqual(workoutResponse);
    });
    it('should throw ForbiddenException if an exercise in the workout does not belong to the user', async () => {
      const createWorkoutRequest = new CreateWorkoutRequest();

      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockRejectedValue(new ExerciseDoesNotBelongToUser());

      await expect(() =>
        workoutsController.create(createWorkoutRequest, 'test-user'),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should throw NotFoundException if an exercise in the workout could not be found', async () => {
      const createWorkoutRequest = new CreateWorkoutRequest();

      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockRejectedValue(new ExerciseNotFoundException());

      await expect(() =>
        workoutsController.create(createWorkoutRequest, 'test-user'),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw NotFoundException if the workout could not be found after creation', async () => {
      const createWorkoutRequest = new CreateWorkoutRequest();

      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockRejectedValue(new WorkoutNotFoundException());

      await expect(() =>
        workoutsController.create(createWorkoutRequest, 'test-user'),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw ConflictException if a set in the workout could not be saved', async () => {
      const createWorkoutRequest = new CreateWorkoutRequest();

      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockRejectedValue(new CouldNotSaveSetException());

      await expect(() =>
        workoutsController.create(createWorkoutRequest, 'test-user'),
      ).rejects.toThrow(ConflictException);
    });
    it('should throw ConflictException if the workout could not be saved', async () => {
      const createWorkoutRequest = new CreateWorkoutRequest();

      jest
        .spyOn(mockWorkoutsService, 'createWorkout')
        .mockRejectedValue(new CouldNotSaveWorkoutException('Workout Name'));

      await expect(() =>
        workoutsController.create(createWorkoutRequest, 'test-user'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('test getWorkouts()', () => {
    it('should return a list of workouts', async () => {
      const user = new User();
      user.id = 'user-id';
      const workoutModel = getWorkoutModelWithExercisesAndSets(user);
      const workoutResponse = getWorkoutResponse(workoutModel);

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
      jest
        .spyOn(mockWorkoutsService, 'getWorkouts')
        .mockResolvedValue([workoutModel]);
      jest
        .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
        .mockReturnValue(workoutResponse);

      const result = await workoutsController.getWorkouts(user.id);

      expect(result).toStrictEqual([workoutResponse]);
    });

    it('should throw NotFoundException if user is not found', () => {
      const user = new User();
      user.id = 'user-id';

      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(new ImATeapotException());

      expect(mockUserService.getById).rejects.toThrow(ImATeapotException);
      expect(
        async () => await workoutsController.getWorkouts(user.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('test getSingleWorkout()', () => {
    it('should successfully return workout', async () => {
      const user = new User();
      user.id = 'user-id';
      const workoutModel = getWorkoutModelWithExercisesAndSets(user);
      const workoutResponse = getWorkoutResponse(workoutModel);

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
      jest
        .spyOn(mockWorkoutsService, 'getById')
        .mockResolvedValue(workoutModel);
      jest
        .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
        .mockReturnValue(workoutResponse);

      const response = await workoutsController.getSingleWorkout('test-user', {
        id: 'test-workout-id',
      });

      expect(response).toStrictEqual(workoutResponse);
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
      const user = new User();
      user.id = 'user-id';

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
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

  describe('test deleteWorkout()', () => {
    it('should return no content when delete is successful', async () => {
      jest.spyOn(mockWorkoutsService, 'deleteById').mockResolvedValue();

      await workoutsController.deleteWorkout('user-id', 'workout-id');

      expect(mockWorkoutsService.deleteById).toHaveBeenCalledTimes(1);
      expect(mockWorkoutsService.deleteById).toHaveBeenCalledWith(
        'workout-id',
        'user-id',
      );
    });
    it('should throw NotFoundException when workout is not found', () => {
      jest
        .spyOn(mockWorkoutsService, 'deleteById')
        .mockRejectedValue(new ResourceNotFoundException('Workout not found'));

      expect(
        async () =>
          await workoutsController.deleteWorkout('user-id', 'workout-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

function getWorkoutModelWithExercisesAndSets(user: User): Workout {
  const workout = getWorkoutModel();
  const exercise = getExerciseModel('exercise-id', 'Exercise', user);
  const set = getSetModel(120, 12, 10, exercise);
  exercise.sets.push(set);
  workout.exercises.push(exercise);
  return workout;
}

function getWorkoutModel(): Workout {
  const model = new Workout();
  model.id = 'workout-id';
  model.name = 'Workout Name';
  model.exercises = [];
  return model;
}

function getExerciseModel(id: string, name: string, user: User): Exercise {
  const model = new Exercise();
  model.id = id;
  model.name = name;
  model.user = user;
  model.sets = [];

  return model;
}

function getSetModel(
  reps: number,
  weight: number,
  rpe: number,
  exercise: Exercise,
): Set {
  const model = new Set();
  model.reps = reps;
  model.weight = weight;
  model.rpe = rpe;
  model.exercise = exercise;
  return model;
}

function getWorkoutResponse(workout: Workout): WorkoutResponse {
  const adapter = new WorkoutResponseAdapter();
  return adapter.fromEntityToResponse(workout);
}
