import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
    it('should return an exercise on success', async () => {
      const testExercise = generateDefaultExercise(1);
      jest
        .spyOn(mockExerciseRepo, 'findOneByOrFail')
        .mockResolvedValue(testExercise);

      const result = await exercisesService.getById(`exercise-${1}`);
      expect(result).toBeInstanceOf(Exercise);
      expect(result).toEqual(testExercise);
    });
    it('should throw EntityNotFoundError if exercise not found', async () => {
      jest
        .spyOn(mockExerciseRepo, 'findOneByOrFail')
        .mockRejectedValue(new EntityNotFoundError(Exercise, ''));

      expect(async () => await exercisesService.getById('123')).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });
});

function generateDefaultExercise(id: number): Exercise {
  const exercise = new Exercise();
  exercise.id = `exericse-${id}`;
  exercise.name = `Exercise ${id}`;
  return exercise;
}

function generateUserCreatedExercise(): Exercise {
  const exercise = new Exercise();
  exercise.id = '1234';
  exercise.name = 'Custom Exercise';
  exercise.isCustom = true;
  exercise.user = new User();

  return exercise;
}
