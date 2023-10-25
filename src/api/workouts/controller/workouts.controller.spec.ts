import { ImATeapotException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/api/user/service/user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Exercise, Set, User, Workout } from 'src/model';
import { CreateWorkoutAdapter } from '../adapter/create-workout.adapter';
import { WorkoutResponseAdapter } from '../adapter/workout-response.adapter';
import { WorkoutResponse } from '../response/workout.response';
import { WorkoutsService } from '../service/workouts.service';
import { WorkoutsController } from './workouts.controller';

describe('WorkoutsController', () => {
  let workoutsController: WorkoutsController;
  let mockWorkoutsService: WorkoutsService;
  let mockUserService: UserService;
  let mockWorkoutResponseAdapter: WorkoutResponseAdapter;

  const mockUser: User = { ...new User(), id: 'test-user' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutsController],
      providers: [
        AuthGuard,
        JwtService,
        CreateWorkoutAdapter,
        WorkoutResponseAdapter,
        {
          provide: WorkoutsService,
          useValue: {
            getWorkouts: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    workoutsController = module.get<WorkoutsController>(WorkoutsController);
    mockWorkoutsService = module.get<WorkoutsService>(WorkoutsService);
    mockUserService = module.get<UserService>(UserService);
    mockWorkoutResponseAdapter = module.get<WorkoutResponseAdapter>(
      WorkoutResponseAdapter,
    );
  });

  it('should be defined', () => {
    expect(workoutsController).toBeDefined();
    expect(mockWorkoutsService).toBeDefined();
    expect(mockUserService).toBeDefined();
    expect(mockWorkoutResponseAdapter).toBeDefined();
  });

  describe('test getWorkouts()', () => {
    const mockWorkoutModel: Workout = {
      id: 'workout-id',
      name: 'Test Workout',
      user: new User(),
      createdAt: new Date(),
      updatedAt: new Date(),
      exercises: [
        { ...new Exercise(), id: 'test-exercise', name: 'Test Exercise' },
      ],
      sets: [
        { ...new Set(), exercise: { ...new Exercise(), id: 'test-exercise' } },
      ],
    };

    const mockWorkoutResponse: WorkoutResponse = {
      id: 'workout-id',
      name: 'Test Workout',
      dateCreated: new Date(),
      exercises: [
        {
          ...new Exercise(),
          id: 'test-exercise',
          name: 'Test Exercise',
          sets: [new Set()],
        },
      ],
    };

    it('should return a list of workouts', async () => {
      jest.spyOn(mockUserService, 'getById').mockResolvedValue(mockUser);
      jest
        .spyOn(mockWorkoutsService, 'getWorkouts')
        .mockResolvedValue([mockWorkoutModel]);
      jest
        .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
        .mockReturnValue(mockWorkoutResponse);

      const result = await workoutsController.getWorkouts(mockUser.id);

      expect(result).toStrictEqual([mockWorkoutResponse]);
    });

    it('should throw NotFoundException if user is not found', () => {
      jest
        .spyOn(mockUserService, 'getById')
        .mockRejectedValue(new ImATeapotException());

      expect(mockUserService.getById).rejects.toThrow(ImATeapotException);
      expect(
        async () => await workoutsController.getWorkouts(mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
