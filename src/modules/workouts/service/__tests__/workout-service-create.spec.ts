import { Test } from '@nestjs/testing';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { InvalidOrderException } from '../../internal-errors/invalid-order.exception';
import { InsertWorkoutModel, WorkoutModel } from '../../models';
import { WorkoutRepository } from '../../repository/workout.repository';
import { WorkoutService } from '../workout.service';

describe('WorkoutService: create', () => {
  let mockExerciseService: ExerciseService;
  let mockWorkoutRepo: WorkoutRepository;
  let workoutService: WorkoutService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkoutService,
        {
          provide: WorkoutRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ExerciseService,
          useValue: {
            validateExercisesExist: jest.fn(),
          },
        },
      ],
    }).compile();

    mockExerciseService = module.get(ExerciseService);
    mockWorkoutRepo = module.get(WorkoutRepository);
    workoutService = module.get(WorkoutService);
  });

  it('should return created workout on success', async () => {
    const model = new InsertWorkoutModel();
    model.name = 'Test Insert Workout';
    model.exercises = [
      {
        exerciseId: 'exercise-uuid-1',
        order: 1,
        sets: [
          { order: 1, weight: 200, reps: 20, rpe: 9 },
          { order: 2, weight: 200, reps: 15, rpe: 10 },
        ],
      },
      {
        exerciseId: 'exercise-uuid-2',
        order: 2,
        sets: [
          { order: 1, weight: 400, reps: 10, rpe: 9 },
          { order: 2, weight: 400, reps: 9, rpe: 10 },
          { order: 3, weight: 400, reps: 8, rpe: 10 },
        ],
      },
    ];

    jest
      .spyOn(mockExerciseService, 'validateExercisesExist')
      .mockResolvedValue(undefined);
    jest.spyOn(mockWorkoutRepo, 'create').mockResolvedValue(new WorkoutModel());

    await workoutService.create(model, 'user-uuid');

    expect(mockExerciseService.validateExercisesExist).toBeCalledWith(
      ['exercise-uuid-1', 'exercise-uuid-2'],
      'user-uuid',
    );
    expect(mockWorkoutRepo.create).toBeCalledWith(model, 'user-uuid');
  });
  it('should throw InvalidOrderException if exercise order does not increase sequentially', async () => {
    const model = new InsertWorkoutModel();
    model.name = 'Test Insert Workout';
    model.exercises = [
      {
        exerciseId: 'exercise-uuid-1',
        order: 1,
        sets: [
          { order: 1, weight: 200, reps: 20, rpe: 9 },
          { order: 2, weight: 200, reps: 15, rpe: 10 },
        ],
      },
      {
        exerciseId: 'exercise-uuid-2',
        order: 5,
        sets: [
          { order: 1, weight: 400, reps: 10, rpe: 9 },
          { order: 2, weight: 400, reps: 9, rpe: 10 },
          { order: 3, weight: 400, reps: 8, rpe: 10 },
        ],
      },
    ];

    jest
      .spyOn(mockExerciseService, 'validateExercisesExist')
      .mockResolvedValue(undefined);

    await expect(workoutService.create(model, 'user-uuid')).rejects.toThrow(
      InvalidOrderException,
    );
    expect(mockWorkoutRepo.create).toHaveBeenCalledTimes(0);
  });
  it('should throw InvalidOrderException if exercise order decreases', async () => {
    const model = new InsertWorkoutModel();
    model.name = 'Test Insert Workout';
    model.exercises = [
      {
        exerciseId: 'exercise-uuid-1',
        order: 1,
        sets: [
          { order: 1, weight: 200, reps: 20, rpe: 9 },
          { order: 2, weight: 200, reps: 15, rpe: 10 },
        ],
      },
      {
        exerciseId: 'exercise-uuid-2',
        order: 0,
        sets: [
          { order: 1, weight: 400, reps: 10, rpe: 9 },
          { order: 2, weight: 400, reps: 9, rpe: 10 },
          { order: 3, weight: 400, reps: 8, rpe: 10 },
        ],
      },
    ];

    jest
      .spyOn(mockExerciseService, 'validateExercisesExist')
      .mockResolvedValue(undefined);

    await expect(workoutService.create(model, 'user-uuid')).rejects.toThrow(
      InvalidOrderException,
    );
    expect(mockWorkoutRepo.create).toHaveBeenCalledTimes(0);
  });
  it('should throw InvalidOrderException if set order does not increase sequentially', async () => {
    const model = new InsertWorkoutModel();
    model.name = 'Test Insert Workout';
    model.exercises = [
      {
        exerciseId: 'exercise-uuid-1',
        order: 1,
        sets: [
          { order: 1, weight: 200, reps: 20, rpe: 9 },
          { order: 2, weight: 200, reps: 15, rpe: 10 },
        ],
      },
      {
        exerciseId: 'exercise-uuid-2',
        order: 2,
        sets: [
          { order: 1, weight: 400, reps: 10, rpe: 9 },
          { order: 6, weight: 400, reps: 9, rpe: 10 },
          { order: 3, weight: 400, reps: 8, rpe: 10 },
        ],
      },
    ];

    jest
      .spyOn(mockExerciseService, 'validateExercisesExist')
      .mockResolvedValue(undefined);

    await expect(workoutService.create(model, 'user-uuid')).rejects.toThrow(
      InvalidOrderException,
    );
    expect(mockWorkoutRepo.create).toHaveBeenCalledTimes(0);
  });
});
