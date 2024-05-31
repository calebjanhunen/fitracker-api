import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Exercise } from 'src/model';
import ExercisesService from './exercises.service';

describe('ExerciseService', () => {
  let exercisesService: ExercisesService;
  let mockExerciseRepo: Repository<Exercise>;
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const exerciseRepoToken = getRepositoryToken(Exercise);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: exerciseRepoToken,
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    exercisesService = module.get<ExercisesService>(ExercisesService);
    mockExerciseRepo = module.get<Repository<Exercise>>(exerciseRepoToken);
  });
  it('should be defined', () => {
    expect(exercisesService).toBeDefined();
    expect(mockExerciseRepo).toBeDefined();
  });

  describe('test findAllExercises()', () => {
    it('should fetch only specified fields if fields are provided', async () => {
      const fields: (keyof Exercise)[] = ['id', 'name', 'primaryMuscle'];

      await exercisesService.findAllExercises('user-id', fields);

      expect(mockQueryBuilder.select).toBeCalled();
      expect(mockQueryBuilder.select).toBeCalledWith([
        'id',
        'name',
        'primaryMuscle',
      ]);
      expect(mockQueryBuilder.getMany).toBeCalled();
    });
  });
});

// function getExerciseModel(): Exercise {
//   const exercise = new Exercise();
//   exercise.id = `exericse-id`;
//   exercise.name = `Exercise Name`;
//   exercise.user = null;
//   return exercise;
// }

/*
  describe('test getDefaultAndUserCreatedExercises()', () => {
    it('should return a collection model of exercises', async () => {
      const exercise1 = getExerciseModel();
      const exercise2 = getExerciseModel();
      const exercises = [exercise1, exercise2];
      jest
        .spyOn(mockExerciseRepo, 'findAndCount')
        .mockResolvedValueOnce([exercises, exercises.length]);
      const page = 1;
      const limit = 3;

      const result = await exercisesService.getDefaultAndUserCreatedExercises(
        new User(),
        page,
        limit,
      );

      const returnVal = new CollectionModel<Exercise>();
      returnVal.listObjects = exercises;
      returnVal.totalCount = exercises.length;
      returnVal.limit = limit;
      returnVal.offset = limit * (page - 1);
      expect(result).toStrictEqual(returnVal);
    });
  });
  
  describe('test createExercise()', () => {
    it('should return the created exercise on success', async () => {
      const exercise = getExerciseModel();

      jest.spyOn(mockExerciseRepo, 'save').mockResolvedValue(exercise);

      const result = await exercisesService.createCustomExercise(exercise);

      expect(result).toBeInstanceOf(Exercise);
    });
  });

  describe('test getById()', () => {
    it('should return an exercise when requesting a default exercise', async () => {
      const user = new User();
      user.id = 'user-id';
      const defaultExercise = getExerciseModel();

      jest
        .spyOn(mockExerciseRepo, 'findOne')
        .mockResolvedValue(defaultExercise);

      const result = await exercisesService.getById(
        defaultExercise.id,
        user.id,
      );
      expect(result).toStrictEqual(defaultExercise);
    });
    it('should return an exercise when requesting a user created exercise', async () => {
      const user = new User();
      user.id = 'user-id';

      const exercise = getExerciseModel();
      exercise.user = user;

      jest.spyOn(mockExerciseRepo, 'findOne').mockResolvedValue(exercise);

      const result = await exercisesService.getById('exercise-id', user.id);

      expect(result).toStrictEqual(exercise);
      expect(result.user?.id).toEqual(user.id);
    });
    it('should throw ExerciseNotFoundException if exercise not found', async () => {
      const user = new User();

      jest.spyOn(mockExerciseRepo, 'findOne').mockResolvedValue(null);

      await expect(() =>
        exercisesService.getById('123', user.id),
      ).rejects.toThrow(ExerciseNotFoundException);
    });
    it('should throw ExerciseDoesNotBelongToUser if exercise user does not match user in request', async () => {
      const user = new User();
      user.id = 'user-id';
      const user2 = new User();
      user.id = 'different-id';

      const exercise = getExerciseModel();
      exercise.user = user2;

      jest.spyOn(mockExerciseRepo, 'findOne').mockResolvedValue(exercise);

      await expect(() =>
        exercisesService.getById(exercise.id, user.id),
      ).rejects.toThrow(ExerciseDoesNotBelongToUser);
    });
  });

  describe('test deleteById()', () => {
    it('should successfully delete exercise', async () => {
      const user = new User();
      user.id = '123';
      const testExercise = getExerciseModel();
      testExercise.user = user;

      jest.spyOn(exercisesService, 'getById').mockResolvedValue(testExercise);
      jest.spyOn(mockExerciseRepo, 'remove').mockResolvedValue(testExercise);

      await exercisesService.deleteById(testExercise.id, user);

      expect(mockExerciseRepo.remove).toHaveBeenCalled();
      expect(mockExerciseRepo.remove).toHaveBeenCalledWith(testExercise);
    });
    it('should throw ExerciseIsNotCustom if deleting a default exercise', async () => {
      const user = new User();
      user.id = 'user-id';
      const testExercise = getExerciseModel();

      jest.spyOn(exercisesService, 'getById').mockResolvedValue(testExercise);

      await expect(() =>
        exercisesService.deleteById(testExercise.id, user),
      ).rejects.toThrow(ExerciseIsNotCustomError);
    });
    it('should throw ExerciseDoesNotBelongToUser if exercise user does not match user in request', async () => {
      const user = new User();
      user.id = '123';
      const testExercise = getExerciseModel();
      jest
        .spyOn(exercisesService, 'getById')
        .mockRejectedValue(new ExerciseDoesNotBelongToUser());

      await expect(() =>
        exercisesService.deleteById(testExercise.id, user),
      ).rejects.toThrow(ExerciseDoesNotBelongToUser);
    });
  });

  describe('test updateById()', () => {
    it('should return the updated exercise on success', async () => {
      const user = new User();
      const exercise = getExerciseModel();
      exercise.user = user;

      jest.spyOn(exercisesService, 'getById').mockResolvedValue(exercise);
      jest.spyOn(mockExerciseRepo, 'save').mockResolvedValue(exercise);

      const result = await exercisesService.update('123', exercise, user);

      expect(result).toBeInstanceOf(Exercise);
    });
    it('should throw ExerciseIsNotCustom if trying to update a default exercise', () => {
      const exercise = getExerciseModel();
      const user = new User();

      jest.spyOn(exercisesService, 'getById').mockResolvedValue(exercise);

      expect(
        async () => await exercisesService.update(exercise.id, exercise, user),
      ).rejects.toThrow(ExerciseIsNotCustomError);
    });
    it('should throw ExerciseUserDoesNotMatchUserInRequest if trying to update an exercise that does not belong to the user', () => {
      const user = new User();
      const exercise = getExerciseModel();

      jest
        .spyOn(exercisesService, 'getById')
        .mockRejectedValue(new ExerciseDoesNotBelongToUser());

      expect(
        async () => await exercisesService.update(exercise.id, exercise, user),
      ).rejects.toThrow(ExerciseDoesNotBelongToUser);
    });
  });
*/
