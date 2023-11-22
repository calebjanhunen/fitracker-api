import {
  ConflictException,
  ForbiddenException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/api/user/service/user.service';
import { SkillLevel } from 'src/api/utils/enums/skill-level';
import { ExerciseUserDoesNotMatchUserInRequestError } from 'src/api/utils/internal-errors/ExerciseUserDoesNotMatchUserInRequestError';
import { UserNotFoundException } from 'src/common/exceptions/user-not-found.exception';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IUser } from 'src/interfaces';
import { CollectionModel, Exercise, User } from 'src/model';
import { EntityNotFoundError, TypeORMError } from 'typeorm';
import { CreateExerciseRequest } from '../request/create-exercise.request';
import { ExerciseResponse } from '../response/exercise.response';
import ExercisesService from '../services/exercises.service';
import { CouldNotDeleteExerciseException } from './exceptions/could-not-delete-exercise.exception';
import { ExerciseNotFoundException } from './exceptions/exercise-not-found.exception';
import ExercisesController from './exercises.controller';

describe('ExerciseController', () => {
  let exercisesController: ExercisesController;
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
            createCustomExercise: jest.fn(),
            getById: jest.fn(),
            deleteById: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    exercisesController = module.get<ExercisesController>(ExercisesController);
    mockExerciseService = module.get<ExercisesService>(ExercisesService);
  });

  it('should be defined', () => {
    expect(exercisesController).toBeDefined();
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

      const result = await exercisesController.getExercises('test-uuid', {
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
        hasMore: false,
      });
    });

    it('should throw NotFoundException if user is not found', () => {
      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(new ImATeapotException());

      expect(mockUserService.getById).rejects.toThrow(ImATeapotException);

      expect(
        async () =>
          await exercisesController.getExercises('test-uuid', {
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
          await exercisesController.getExercises('test-uuid', {
            page: 1,
            limit: 1,
          }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('test createExercise()', () => {
    it('should return exercise on success', async () => {
      const testCustomExercise = generateUserCreatedExercise();
      const request = new CreateExerciseRequest();

      jest
        .spyOn(mockExerciseService, 'createCustomExercise')
        .mockResolvedValue(testCustomExercise);

      const result = await exercisesController.createExercise('123', request);

      expect(result).toBeInstanceOf(ExerciseResponse);
    });
    it('should throw UserNotFoundException if user is not found', () => {
      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(EntityNotFoundError);
      const request = new CreateExerciseRequest();

      expect(
        async () => await exercisesController.createExercise('123', request),
      ).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('test getExercise()', () => {
    it('should return exercise on success', async () => {
      const testExercise = generateDefaultExercise(1);
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(new User());
      jest
        .spyOn(mockExerciseService, 'getById')
        .mockResolvedValue(testExercise);

      const result = await exercisesController.getExercise(
        'user-id',
        'exercise-id',
      );

      expect(result).toBeInstanceOf(ExerciseResponse);
      expect(result).toEqual(testExercise);
    });
    it('should throw ExerciseNotFoundException if exercise is not found', () => {
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(new User());
      jest
        .spyOn(mockExerciseService, 'getById')
        .mockRejectedValue(new EntityNotFoundError(Exercise, ''));

      expect(
        async () =>
          await exercisesController.getExercise('user-id', 'exercise-id'),
      ).rejects.toThrow(ExerciseNotFoundException);
    });
    it('should throw ForbiddenException if requesting an exercise that does not belong to that user', () => {
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(new User());
      jest
        .spyOn(mockExerciseService, 'getById')
        .mockRejectedValue(new ExerciseUserDoesNotMatchUserInRequestError());

      expect(
        async () =>
          await exercisesController.getExercise('user-id', 'exercise-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('test deleteExercise()', () => {
    it('should return no content on success of deleting exercise', async () => {
      const user = new User();

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
      jest.spyOn(mockExerciseService, 'deleteById').mockResolvedValue();

      await exercisesController.deleteExercise(user.id, 'exercise-id');

      expect(mockExerciseService.deleteById).toHaveBeenCalled();
      expect(mockExerciseService.deleteById).toHaveBeenCalledWith(
        'exercise-id',
        user,
      );
    });
    it('should throw CouldNotDeleteExerciseException if exercise could not be deleted', () => {
      const user = new User();

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
      jest
        .spyOn(mockExerciseService, 'deleteById')
        .mockRejectedValue(new TypeORMError());

      expect(
        async () =>
          await exercisesController.deleteExercise(user.id, 'exercise-id'),
      ).rejects.toThrow(CouldNotDeleteExerciseException);
    });
    it('should throw ExerciseNotFoundException if exercise could not be found', () => {
      const user = new User();

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
      jest
        .spyOn(mockExerciseService, 'deleteById')
        .mockRejectedValue(new EntityNotFoundError(Exercise, ''));

      expect(
        async () =>
          await exercisesController.deleteExercise(user.id, 'exercise-id'),
      ).rejects.toThrow(ExerciseNotFoundException);
    });
    it('should throw ForbiddenException if deleting an exercise that does not belong to that user', () => {
      const user = new User();

      jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
      jest
        .spyOn(mockExerciseService, 'deleteById')
        .mockRejectedValue(new ExerciseUserDoesNotMatchUserInRequestError());

      expect(
        async () =>
          await exercisesController.deleteExercise(user.id, 'exercise-id'),
      ).rejects.toThrow(ForbiddenException);
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
