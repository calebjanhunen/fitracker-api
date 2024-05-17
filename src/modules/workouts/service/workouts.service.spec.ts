import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exercise, Set, User, Workout } from 'src/model';
import { WorkoutExercise } from 'src/model/workout-exercises.entity';
import { ExerciseNotFoundException } from 'src/modules/exercises/services/exceptions/exercise-not-found.exception';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import {
  CreateWorkoutRequestDTO,
  ExerciseDTO,
  SetDTO,
} from 'src/modules/workouts/dtos/create-workout.dto';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  EntityTarget,
  QueryRunner,
  Repository,
  TypeORMError,
} from 'typeorm';
import { CouldNotSaveSetException } from './exceptions/could-not-save-set.exception';
import { CouldNotSaveWorkoutException } from './exceptions/could-not-save-workout.exception';
import { WorkoutNotFoundException } from './exceptions/workout-not-found.exception';
import { WorkoutsService } from './workouts.service';

interface SimplifiedEntityManager {
  create<Entity>(
    entityClass: EntityTarget<Entity>,
    plainObject?: DeepPartial<Entity>,
  ): Entity;
}

describe('WorkoutsService', () => {
  const workoutRepoToken = getRepositoryToken(Workout);
  let workoutsService: WorkoutsService;
  let mockWorkoutRepo: Repository<Workout>;
  let mockExercisesService: ExercisesService;
  let mockUserService: UserService;
  let mockDataSource: DataSource;

  const mockQueryRunner: DeepPartial<QueryRunner> = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    mockQueryRunner;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        {
          provide: workoutRepoToken,
          useClass: Repository,
        },
        {
          provide: ExercisesService,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    workoutsService = module.get<WorkoutsService>(WorkoutsService);
    mockWorkoutRepo = module.get<Repository<Workout>>(workoutRepoToken);
    mockDataSource = module.get<DataSource>(DataSource);
    mockExercisesService = module.get<ExercisesService>(ExercisesService);
    mockUserService = module.get<UserService>(UserService);

    jest
      .spyOn(mockDataSource, 'createQueryRunner')
      .mockReturnValue(mockQueryRunner as QueryRunner);

    jest
      .spyOn(mockQueryRunner.manager as SimplifiedEntityManager, 'create')
      .mockReturnValueOnce(new Workout());
    jest
      .spyOn(mockQueryRunner.manager as SimplifiedEntityManager, 'create')
      .mockReturnValueOnce(new Exercise());
    jest
      .spyOn(mockQueryRunner.manager as SimplifiedEntityManager, 'create')
      .mockReturnValueOnce(new Set());
  });

  it('should be defined', () => {
    expect(workoutsService).toBeDefined();
    expect(mockWorkoutRepo).toBeDefined();
  });

  describe('Test createWorkout()', () => {
    it('should successfully create workout and return workout entity', async () => {
      const mockUser = getMockUser();
      const mockWorkoutDTO = getMockWorkoutDTO();
      mockWorkoutDTO.exercises.push(getMockExerciseDTO());
      mockWorkoutDTO.exercises[0].sets.push(getMockSetDTO(120, 12, 10));
      const mockWorkoutEntity = getMockWorkoutEntity();

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(mockUser);
      jest
        .spyOn(workoutsService, 'getById')
        .mockResolvedValue(mockWorkoutEntity);
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce(new Workout());
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce(new WorkoutExercise());
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce(new Set());

      const createdWorkout = await workoutsService.createWorkout(
        mockWorkoutDTO,
        mockUser.id,
      );

      const expectedResult = new Workout();
      expectedResult.id = 'workout-entity-id';
      expectedResult.name = 'Test Workout Entity';
      expectedResult.user = mockUser;
      expect(createdWorkout).toStrictEqual(expectedResult);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
    });
    it('should throw ExerciseNotFoundException if exercise is not found', async () => {
      const workout = getMockWorkoutDTO();
      workout.exercises.push(getMockExerciseDTO());

      jest
        .spyOn(mockExercisesService, 'getById')
        .mockRejectedValue(new ExerciseNotFoundException());

      await expect(() =>
        workoutsService.createWorkout(workout, 'user-id'),
      ).rejects.toThrow(ExerciseNotFoundException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      // expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
    it('should throw CouldNotSaveSetException if set can not be saved', async () => {
      const workout = getMockWorkoutDTO();
      workout.exercises.push(getMockExerciseDTO());
      workout.exercises[0].sets.push(getMockSetDTO(120, 10, 10));

      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce(new Workout());
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockResolvedValueOnce(new WorkoutExercise());
      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockRejectedValue(new TypeORMError());

      await expect(() =>
        workoutsService.createWorkout(workout, 'user-id'),
      ).rejects.toThrow(CouldNotSaveSetException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      // expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
    it('should throw CouldNotSaveWorkoutException if workout can not be saved', async () => {
      const workout = getMockWorkoutDTO();
      workout.exercises.push(getMockExerciseDTO());
      workout.exercises[0].sets.push(getMockSetDTO(120, 10, 10));

      jest
        .spyOn(mockQueryRunner.manager as EntityManager, 'save')
        .mockRejectedValue(new TypeORMError());

      await expect(() =>
        workoutsService.createWorkout(workout, 'user-id'),
      ).rejects.toThrow(CouldNotSaveWorkoutException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      // expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('Test getById()', () => {
    it('should sucessfully find and return a workout entity', async () => {
      const workoutEntity = new Workout();
      workoutEntity.id = 'workout-id';
      const userId = 'user-id';

      jest.spyOn(mockWorkoutRepo, 'findOne').mockResolvedValue(workoutEntity);

      const result = await workoutsService.getById(workoutEntity.id, userId);

      expect(mockWorkoutRepo.findOne).toBeCalledWith({
        where: { id: 'workout-id', user: { id: 'user-id' } },
        relations: [
          'workoutExercise',
          'workoutExercise.exercise',
          'workoutExercise.set',
        ],
      });
      expect(result).toStrictEqual(workoutEntity);
    });
    it('should throw WorkoutNotFoundException if no workout is found', () => {
      const workoutId = 'workout-id';
      const userId = 'user-id';

      jest.spyOn(mockWorkoutRepo, 'findOne').mockResolvedValue(null);

      expect(
        async () => await workoutsService.getById(workoutId, userId),
      ).rejects.toThrow(WorkoutNotFoundException);
    });
  });
});

function getMockUser(): User {
  const user = new User();
  user.id = 'user-id';
  return user;
}

function getMockWorkoutDTO(): CreateWorkoutRequestDTO {
  const workoutDTO = new CreateWorkoutRequestDTO();
  workoutDTO.name = 'Test Workout';
  workoutDTO.exercises = [];
  return workoutDTO;
}

function getMockExerciseDTO(): ExerciseDTO {
  const exerciseDTO = new ExerciseDTO();
  exerciseDTO.id = 'exercise-id';
  exerciseDTO.sets = [];
  return exerciseDTO;
}

function getMockSetDTO(weight: number, reps: number, rpe: number): SetDTO {
  const setDTO = new SetDTO();
  setDTO.reps = reps;
  setDTO.rpe = rpe;
  setDTO.weight = weight;
  return setDTO;
}

function getMockWorkoutEntity(): Workout {
  const workoutEntity = new Workout();
  workoutEntity.id = 'workout-entity-id';
  workoutEntity.name = 'Test Workout Entity';
  workoutEntity.user = getMockUser();

  return workoutEntity;
}