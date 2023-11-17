import {
  ConflictException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/api/user/service/user.service';
import { ExerciseDifficultyLevel } from 'src/api/utils/enums/exercise-difficulty-level';
import { SkillLevel } from 'src/api/utils/enums/skill-level';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IExercise, IUser } from 'src/interfaces';
import { CollectionModel, Exercise } from 'src/model';
import ExercisesService from '../services/exercises.service';
import ExercisesController from './exercises.controller';

describe('ExerciseController', () => {
  let mockExerciseController: ExercisesController;
  let mockExerciseService: ExercisesService;
  const mockUserService = {
    getById: jest.fn(),
  };

  const testExercises: Exercise[] = [
    generateDefaultExercise(1),
    generateDefaultExercise(2),
    generateDefaultExercise(3),
  ];

  const testUser: IUser = {
    id: 'test-uuid',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: 'Test',
    lastName: 'User',
    password: '123',
    email: 'test@example.com',
    skillLevel: SkillLevel.advanced,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        JwtService,
        AuthGuard,
        {
          provide: ExercisesService,
          useValue: {
            getDefaultAndUserCreatedExercises: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    mockExerciseController =
      module.get<ExercisesController>(ExercisesController);
    mockExerciseService = module.get<ExercisesService>(ExercisesService);
  });

  it('should be defined', () => {
    expect(mockExerciseController).toBeDefined();
    expect(mockExerciseService).toBeDefined();
  });

  describe('test getAllExercises()', () => {
    it('should return list of exercises on success', async () => {
      const exerciseCollectionModel = new CollectionModel<Exercise>();
      exerciseCollectionModel.listObjects = testExercises;
      exerciseCollectionModel.totalCount = testExercises.length;
      jest
        .spyOn(mockExerciseService, 'getDefaultAndUserCreatedExercises')
        .mockResolvedValueOnce(exerciseCollectionModel);
      jest.spyOn(mockUserService, 'getById').mockResolvedValueOnce(testUser);

      const result = await mockExerciseController.getExercises('test-uuid', {
        page: 1,
        limit: 1,
      });

      expect(
        mockExerciseService.getDefaultAndUserCreatedExercises,
      ).toBeCalled();
      expect(
        mockExerciseService.getDefaultAndUserCreatedExercises,
      ).toBeCalledWith(testUser, 1, 1);

      expect(result).toEqual({
        resources: testExercises,
        totalRecords: testExercises.length,
      });
    });

    it('should throw NotFoundException if user is not found', () => {
      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(new ImATeapotException());

      expect(mockUserService.getById).rejects.toThrow(ImATeapotException);

      expect(
        async () =>
          await mockExerciseController.getExercises('test-uuid', {
            page: 1,
            limit: 1,
          }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if there is an error getting exercises', () => {
      jest
        .spyOn(mockExerciseService, 'getDefaultAndUserCreatedExercises')
        .mockRejectedValue(new ImATeapotException());
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(testUser);

      expect(
        mockExerciseService.getDefaultAndUserCreatedExercises,
      ).rejects.toThrowError(ImATeapotException);

      expect(
        async () =>
          await mockExerciseController.getExercises('test-uuid', {
            page: 1,
            limit: 1,
          }),
      ).rejects.toThrow(ConflictException);
    });
  });
});

function generateDefaultExercise(id: number): Exercise {
  const exercise = new Exercise();
  exercise.id = `exericse-${id}`;
  exercise.name = `Exercise ${id}`;
  return exercise;
}
