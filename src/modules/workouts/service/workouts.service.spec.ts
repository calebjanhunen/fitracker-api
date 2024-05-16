import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { Exercise, Set, User, Workout } from 'src/model';
import { ExerciseNotFoundException } from 'src/modules/exercises/services/exceptions/exercise-not-found.exception';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  QueryRunner,
  Repository,
  TypeORMError,
} from 'typeorm';
import { CouldNotDeleteWorkoutException } from './exceptions/could-not-delete-workout.exception';
import { CouldNotSaveSetException } from './exceptions/could-not-save-set.exception';
import { CouldNotSaveWorkoutException } from './exceptions/could-not-save-workout.exception';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  let workoutsService: WorkoutsService;
  let mockWorkoutRepo: Repository<Workout>;
  let mockExercisesService: ExercisesService;
  let mockDataSource: DataSource;
  let mockQueryRunner: DeepPartial<QueryRunner>;

  const workoutRepoToken = getRepositoryToken(Workout);

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        remove: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        {
          provide: workoutRepoToken,
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
        {
          provide: ExercisesService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    workoutsService = module.get<WorkoutsService>(WorkoutsService);
    mockWorkoutRepo = module.get<Repository<Workout>>(workoutRepoToken);
    mockDataSource = module.get<DataSource>(DataSource);
    mockExercisesService = module.get<ExercisesService>(ExercisesService);

    jest
      .spyOn(mockDataSource, 'createQueryRunner')
      .mockReturnValue(mockQueryRunner as QueryRunner);
  });

  it('should be defined', () => {
    expect(workoutsService).toBeDefined();
    expect(mockWorkoutRepo).toBeDefined();
  });

  describe('test createWorkout()', () => {
    it('should return the created workout on success', async () => {
      // Create test user
      const user = new User();
      user.id = 'user-id';

      // Create test workout
      const workout = getWorkoutModel();
      workout.user = user;
      const exercise = getExerciseModel('exercise-id', 'Exercise Name', user);
      const set = getSetModel(12, 120, 10, exercise);
      exercise.sets.push(set);
      workout.exercises.push(exercise);

      jest.spyOn(mockExercisesService, 'getById').mockResolvedValue(exercise);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce([set]);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce(workout);
      jest.spyOn(workoutsService, 'getById').mockResolvedValue(workout);

      const result = await workoutsService.createWorkout(workout);

      expect(result).toStrictEqual(workout);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
    });
    it('should rollback transaction if exercise is not found', async () => {
      // Create test user
      const user = new User();
      user.id = 'user-id';

      // Create test workout
      const workout = getWorkoutModel();
      workout.user = user;
      const exercise = getExerciseModel('exercise-id', 'Exercise Name', user);
      const set = getSetModel(12, 120, 10, exercise);
      exercise.sets.push(set);
      workout.exercises.push(exercise);

      jest
        .spyOn(mockExercisesService, 'getById')
        .mockRejectedValue(new ExerciseNotFoundException());

      await expect(() =>
        workoutsService.createWorkout(workout),
      ).rejects.toThrow(ExerciseNotFoundException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
    it('should rollback transaction if there is an error saving the sets', async () => {
      // Create test user
      const user = new User();
      user.id = 'user-id';

      // Create test workout
      const workout = getWorkoutModel();
      workout.user = user;
      const exercise = getExerciseModel('exercise-id', 'Exercise Name', user);
      const set = getSetModel(12, 120, 10, exercise);
      exercise.sets.push(set);
      workout.exercises.push(exercise);

      jest.spyOn(mockExercisesService, 'getById').mockResolvedValue(exercise);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockRejectedValue(new TypeORMError());

      await expect(() =>
        workoutsService.createWorkout(workout),
      ).rejects.toThrow(CouldNotSaveSetException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
    it('should rollback transaction if there is an error saving the workout', async () => {
      // Create test user
      const user = new User();
      user.id = 'user-id';

      // Create test workout
      const workout = getWorkoutModel();
      workout.user = user;
      const exercise = getExerciseModel('exercise-id', 'Exercise Name', user);
      const set = getSetModel(12, 120, 10, exercise);
      exercise.sets.push(set);
      workout.exercises.push(exercise);

      jest.spyOn(mockExercisesService, 'getById').mockResolvedValue(exercise);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce([set]);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockRejectedValue(new TypeORMError());

      await expect(() =>
        workoutsService.createWorkout(workout),
      ).rejects.toThrow(CouldNotSaveWorkoutException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('test getWorkouts()', () => {
    it('should successfully return a list of workouts', async () => {
      const user = new User();
      user.id = 'user-id';
      const workout1 = getWorkoutModelWithExercisesAndSets(user);
      workout1.id = 'workout-1';
      const workout2 = getWorkoutModelWithExercisesAndSets(user);
      workout2.id = 'workout-2';

      jest
        .spyOn(mockWorkoutRepo, 'find')
        .mockResolvedValue([workout1, workout2]);

      const result = await workoutsService.getWorkouts(user);

      expect(result).toStrictEqual([workout1, workout2]);
      expect(mockWorkoutRepo.find).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        relations: ['exercises', 'exercises.sets'],
      });
    });
    it('Should return an empty array if no workouts exist for the user', async () => {
      const user = new User();
      user.id = 'user-id';

      jest.spyOn(mockWorkoutRepo, 'find').mockResolvedValue([]);

      const result = await workoutsService.getWorkouts(user);

      expect(result).toStrictEqual([]);
    });
  });

  describe('test getById()', () => {
    it('should successfully return a workout', async () => {
      const user = new User();
      user.id = 'user-id';

      const workout = getWorkoutModel();
      workout.id = 'workout-id';
      workout.exercises = [
        getExerciseModel('exercise-id', 'Exercise Name', user),
      ];

      jest.spyOn(mockWorkoutRepo, 'findOne').mockResolvedValue(workout);

      const result = await workoutsService.getById(workout.id, user.id);

      expect(mockWorkoutRepo.findOne).toBeCalledWith({
        where: { id: 'workout-id', user: { id: 'user-id' } },
        relations: ['exercises', 'exercises.sets'],
      });
      expect(result).toStrictEqual(workout);
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
      const user = new User();
      const workout = getWorkoutModel();
      const exercise = getExerciseModel('id', 'name', user);
      const set = getSetModel(1, 1, 1, new Exercise());
      exercise.sets.push(set);
      workout.exercises.push(exercise);

      jest.spyOn(workoutsService, 'getById').mockResolvedValue(workout);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'remove')
        .mockResolvedValueOnce([set]);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'remove')
        .mockResolvedValueOnce([workout]);

      await workoutsService.deleteById(workout.id, 'user-id');

      expect(mockQueryRunner.manager?.remove).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.manager?.remove).toReturnTimes(2);
    });
    it('should throw CouldNotDeleteWorkoutException if workout can not be deleted', async () => {
      jest.spyOn(workoutsService, 'getById').mockResolvedValue(new Workout());
      jest
        .spyOn(mockWorkoutRepo, 'delete')
        .mockRejectedValue(new TypeORMError());

      await expect(() =>
        workoutsService.deleteById('workout-id', 'user-id'),
      ).rejects.toThrow(CouldNotDeleteWorkoutException);
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
