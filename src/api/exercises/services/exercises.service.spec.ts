import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExerciseDifficultyLevel } from 'src/api/utils/enums/exercise-difficulty-level';
import { Exercise } from 'src/model';
import { Repository } from 'typeorm';
import ExercisesService from './exercises.service';

describe('ExerciseService', () => {
  let mockExerciseService: ExercisesService;
  let mockExerciseRepo: Repository<Exercise>;
  const testExercises: Exercise[] = [
    {
      id: crypto.randomUUID(),
      name: 'test-exercise',
      createdAt: new Date(),
      updatedAt: new Date(),
      difficultyLevel: ExerciseDifficultyLevel.beginner,
      equipment: 'barbell',
      instructions: ['step1'],
      primaryMuscle: 'test',
      secondaryMuscles: ['test1'],
      isCustom: false,
      user: null,
    },
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

  describe('test getDefaultExercises()', () => {
    it('should return array of exercises on success', async () => {
      jest.spyOn(mockExerciseRepo, 'find').mockResolvedValueOnce(testExercises);

      const result = await mockExerciseService.getDefaultExercises();

      expect(result).toStrictEqual(testExercises);
    });
  });
});
