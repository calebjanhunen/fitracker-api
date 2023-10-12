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
import ExercisesService from '../services/exercises.service';
import ExercisesController from './exercises.controller';

describe('ExerciseController', () => {
  let mockExerciseController: ExercisesController;
  let mockExerciseService: ExercisesService;
  const mockUserService = {
    getById: jest.fn(),
  };

  const testExercises: IExercise[] = [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Test Exercise',
      difficultyLevel: ExerciseDifficultyLevel.beginner,
      equipment: 'dumbbells',
      instructions: ['Step 1.', 'Step 2.', 'Step 3', 'Step 4'],
      primaryMuscle: 'bicep',
      secondaryMuscles: ['forearm'],
      isCustom: true,
      user: null,
    },
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
      jest
        .spyOn(mockExerciseService, 'getDefaultAndUserCreatedExercises')
        .mockResolvedValueOnce(testExercises);
      jest.spyOn(mockUserService, 'getById').mockResolvedValueOnce(testUser);

      const result = await mockExerciseController.getAllExercises('test-uuid');

      expect(
        mockExerciseService.getDefaultAndUserCreatedExercises,
      ).toBeCalled();
      expect(
        mockExerciseService.getDefaultAndUserCreatedExercises,
      ).toBeCalledWith(testUser);

      expect(result).toStrictEqual(testExercises);
    });

    it('should throw NotFoundException if user is not found', () => {
      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(new ImATeapotException());

      expect(mockUserService.getById).rejects.toThrow(ImATeapotException);

      expect(
        async () => await mockExerciseController.getAllExercises('test-uuid'),
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
        async () => await mockExerciseController.getAllExercises('test-uuid'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
