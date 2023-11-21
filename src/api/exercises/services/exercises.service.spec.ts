import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExerciseUserDoesNotMatchUserInRequestError } from 'src/api/utils/internal-errors/ExerciseUserDoesNotMatchUserInRequestError';
import { CollectionModel, Exercise, User } from 'src/model';
import { EntityNotFoundError, Repository } from 'typeorm';
import ExercisesService from './exercises.service';

describe('ExerciseService', () => {
  let exercisesService: ExercisesService;
  let mockExerciseRepo: Repository<Exercise>;
  const testExercises: Exercise[] = [
    generateDefaultExercise(1),
    generateDefaultExercise(2),
    generateDefaultExercise(3),
  ];

  const exerciseRepoToken = getRepositoryToken(Exercise);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: exerciseRepoToken,
          useClass: Repository,
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

  describe('test getDefaultAndUserCreatedExercises()', () => {
    it('should return a collection model of exercises', async () => {
      jest
        .spyOn(mockExerciseRepo, 'findAndCount')
        .mockResolvedValueOnce([testExercises, testExercises.length]);
      const page = 1;
      const limit = 3;

      const result = await exercisesService.getDefaultAndUserCreatedExercises(
        new User(),
        page,
        limit,
      );

      const returnVal = new CollectionModel<Exercise>();
      returnVal.listObjects = testExercises;
      returnVal.totalCount = testExercises.length;
      returnVal.limit = limit;
      returnVal.offset = limit * (page - 1);
      expect(result).toStrictEqual(returnVal);
    });
  });

  describe('test createExercise()', () => {
    it('should return the created exercise on success', async () => {
      const testExercise = generateUserCreatedExercise();
      jest.spyOn(mockExerciseRepo, 'save').mockResolvedValue(testExercise);

      const result = await exercisesService.createCustomExercise(testExercise);

      expect(result).toBeInstanceOf(Exercise);
    });
  });

  describe('test getById()', () => {
    it('should return an exercise when requesting a default exercise', async () => {
      const testExercise = generateDefaultExercise(1);

      jest
        .spyOn(mockExerciseRepo, 'findOneOrFail')
        .mockResolvedValue(testExercise);

      const result = await exercisesService.getById(
        `exercise-${1}`,
        new User(),
      );
      expect(result).toBeInstanceOf(Exercise);
      expect(result).toEqual(testExercise);
    });
    it('should return an exercise when requesting a user created exercise', async () => {
      const user = new User();
      user.id = 'test-user-id';

      const exercise = generateUserCreatedExercise(user.id);

      jest.spyOn(mockExerciseRepo, 'findOneOrFail').mockResolvedValue(exercise);

      const result = await exercisesService.getById('exercise-id', user);

      expect(result).toBeInstanceOf(Exercise);
      expect(result).toEqual(exercise);
      expect(result.user?.id).toEqual(user.id);
    });
    it('should throw EntityNotFoundError if exercise not found', async () => {
      jest
        .spyOn(mockExerciseRepo, 'findOneOrFail')
        .mockRejectedValue(new EntityNotFoundError(Exercise, ''));

      expect(
        async () => await exercisesService.getById('123', new User()),
      ).rejects.toThrow(EntityNotFoundError);
    });
    it('should throw ExerciseUserDoesNotMatchUserInRequestError if exercise user does not match user in request', () => {
      const user = new User();
      user.id = 'test-user-id';

      const exercise = generateUserCreatedExercise('not-the-same-id');

      jest.spyOn(mockExerciseRepo, 'findOneOrFail').mockResolvedValue(exercise);

      expect(
        async () => await exercisesService.getById('exercise-id', user),
      ).rejects.toThrow(ExerciseUserDoesNotMatchUserInRequestError);
    });
  });

  describe('test deleteOne()', () => {
    it('should successfully delete the exercise', async () => {
      const testExercise = generateDefaultExercise(1);
      jest.spyOn(mockExerciseRepo, 'remove').mockResolvedValue(testExercise);

      await exercisesService.deleteOne(testExercise, new User());

      expect(mockExerciseRepo.remove).toHaveBeenCalled();
      expect(mockExerciseRepo.remove).toHaveBeenCalledWith(testExercise);
    });
    it('should successfully delete a custom exercise if the user the exercise belongs to matches user in request', async () => {
      const user = new User();
      user.id = '123';
      const testExercise = generateUserCreatedExercise(user.id);
      jest.spyOn(mockExerciseRepo, 'remove').mockResolvedValue(testExercise);

      await exercisesService.deleteOne(testExercise, user);

      expect(mockExerciseRepo.remove).toHaveBeenCalled();
      expect(mockExerciseRepo.remove).toHaveBeenCalledWith(testExercise);
    });
    it('should throw ExerciseUserDoesNotMatchUserInRequestError if exercise user does not match user in request', () => {
      const user = new User();
      user.id = '123';
      const testExercise = generateUserCreatedExercise('not-the-same-id');
      jest.spyOn(mockExerciseRepo, 'remove').mockResolvedValue(testExercise);

      expect(
        async () => await exercisesService.deleteOne(testExercise, user),
      ).rejects.toThrow(ExerciseUserDoesNotMatchUserInRequestError);
    });
  });
});

function generateDefaultExercise(id: number): Exercise {
  const exercise = new Exercise();
  exercise.id = `exericse-${id}`;
  exercise.name = `Exercise ${id}`;
  return exercise;
}

function generateUserCreatedExercise(userId?: string): Exercise {
  const exercise = new Exercise();
  exercise.id = '1234';
  exercise.name = 'Custom Exercise';
  exercise.isCustom = true;
  exercise.user = new User();
  exercise.user.id = userId || 'test-user-id';

  return exercise;
}
