import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionModel, Exercise, User } from 'src/model';
import { Repository } from 'typeorm';
import ExercisesService from './exercises.service';

describe('ExerciseService', () => {
  let mockExerciseService: ExercisesService;
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

    mockExerciseService = module.get<ExercisesService>(ExercisesService);
    mockExerciseRepo = module.get<Repository<Exercise>>(exerciseRepoToken);
  });
  it('should be defined', () => {
    expect(mockExerciseService).toBeDefined();
    expect(mockExerciseRepo).toBeDefined();
  });

  describe('test getDefaultAndUserCreatedExercises()', () => {
    it('should return a collection model of exercises', async () => {
      jest
        .spyOn(mockExerciseRepo, 'findAndCount')
        .mockResolvedValueOnce([testExercises, testExercises.length]);

      const result =
        await mockExerciseService.getDefaultAndUserCreatedExercises(
          new User(),
          1,
          3,
        );

      const returnVal = new CollectionModel<Exercise>();
      returnVal.listObjects = testExercises;
      returnVal.totalCount = testExercises.length;
      expect(result).toStrictEqual(returnVal);
    });
  });
});

function generateDefaultExercise(id: number): Exercise {
  const exercise = new Exercise();
  exercise.id = `exericse-${id}`;
  exercise.name = `Exercise ${id}`;
  return exercise;
}
