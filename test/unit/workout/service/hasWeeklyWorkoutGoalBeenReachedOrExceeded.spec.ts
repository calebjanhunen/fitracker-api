import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from 'src/common/logger/logger.service';
import { ExerciseVariationService } from 'src/modules/exercises/services';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { UserService } from 'src/modules/user/service/user.service';
import {
  LevelCalculator,
  WorkoutEffortXpCalculator,
  WorkoutGoalXpCalculator,
} from 'src/modules/workouts/calculator';
import { WorkoutModel } from 'src/modules/workouts/models';
import { CreateWorkoutRepository } from 'src/modules/workouts/repository';
import { WorkoutRepository } from 'src/modules/workouts/repository/workout.repository';
import { CreateWorkoutService } from 'src/modules/workouts/service';
import { MockLoggerService } from 'test/mocks/mock-logger.service';

describe('CreateWorkoutService - hasWorkoutGoalBeenReachedOrExceeded', () => {
  let createWorkoutService: CreateWorkoutService;
  let mockExerciseService: Partial<ExerciseService>;
  let mockExerciseVariationService: Partial<ExerciseVariationService>;
  let mockWorkoutRepo: Partial<WorkoutRepository>;
  let mockCreateWorkoutRepo: Partial<CreateWorkoutRepository>;
  let mockUserService: Partial<UserService>;
  let mockWorkoutEffortXpCalculator: Partial<WorkoutEffortXpCalculator>;
  let mockWorkoutGoalXpCalculator: Partial<WorkoutGoalXpCalculator>;
  let mockLevelCalculator: Partial<LevelCalculator>;
  const userId = 'user-id';

  beforeEach(async () => {
    mockExerciseService = {};
    mockExerciseVariationService = {};
    mockWorkoutRepo = {};
    mockCreateWorkoutRepo = {};
    mockUserService = {};
    mockWorkoutEffortXpCalculator = {};
    mockWorkoutGoalXpCalculator = {};
    mockLevelCalculator = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWorkoutService,
        { provide: ExerciseService, useValue: mockExerciseService },
        {
          provide: ExerciseVariationService,
          useValue: mockExerciseVariationService,
        },
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
        { provide: CreateWorkoutRepository, useValue: mockCreateWorkoutRepo },
        { provide: UserService, useValue: mockUserService },
        {
          provide: WorkoutEffortXpCalculator,
          useValue: mockWorkoutEffortXpCalculator,
        },
        {
          provide: WorkoutGoalXpCalculator,
          useValue: mockWorkoutGoalXpCalculator,
        },
        {
          provide: LevelCalculator,
          useValue: mockLevelCalculator,
        },
        {
          provide: LoggerService,
          useValue: new MockLoggerService(),
        },
      ],
    }).compile();

    createWorkoutService =
      module.get<CreateWorkoutService>(CreateWorkoutService);
  });

  it('GivenWorkoutGoalAchievedAtThatIsThisWeek_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnFalse', async () => {
    //December 29th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 29, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;

    const result = await createWorkoutService[
      'hasWorkoutGoalBeenReachedOrExceeded'
    ](
      weeklyWorkoutGoalAchievedAt,
      workoutCreatedAt,
      weeklyWorkoutGoal,
      userId,
      3,
    );
    expect(result).toBe(false);
  });
  it('GivenMoreThanZeroWorkoutsAlreadyCompletedOnSameDateAsCreatedWorkout_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnFalse', async () => {
    //December 27th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 27, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;

    mockWorkoutRepo.getWorkoutsByDate = jest
      .fn()
      .mockResolvedValue([new WorkoutModel()]);

    const result = await createWorkoutService[
      'hasWorkoutGoalBeenReachedOrExceeded'
    ](
      weeklyWorkoutGoalAchievedAt,
      workoutCreatedAt,
      weeklyWorkoutGoal,
      userId,
      3,
    );

    expect(result).toBe(false);
  });
  it('GivenNumberOfDaysWithWorkoutsThisWeekThatsLessThanWeeklyWorkoutGoal_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnFalse', async () => {
    //December 27th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 27, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;
    const daysWithWorkoutsThisWeek = 2;

    mockWorkoutRepo.getWorkoutsByDate = jest.fn().mockResolvedValue([]);

    const result = await createWorkoutService[
      'hasWorkoutGoalBeenReachedOrExceeded'
    ](
      weeklyWorkoutGoalAchievedAt,
      workoutCreatedAt,
      weeklyWorkoutGoal,
      userId,
      daysWithWorkoutsThisWeek,
    );

    expect(result).toBe(false);
  });

  it('GivenNumberOfDaysWithWorkoutsThisWeekEqualToWeeklyWorkoutGoal_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnTrue', async () => {
    //December 27th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 27, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;
    const daysWithWorkoutsThisWeek = 4;

    mockWorkoutRepo.getWorkoutsByDate = jest.fn().mockResolvedValue([]);

    const result = await createWorkoutService[
      'hasWorkoutGoalBeenReachedOrExceeded'
    ](
      weeklyWorkoutGoalAchievedAt,
      workoutCreatedAt,
      weeklyWorkoutGoal,
      userId,
      daysWithWorkoutsThisWeek,
    );

    expect(result).toBe(true);
  });
  it('GivenNumberOfDaysWithWorkoutsThisWeekGreaterThanWeeklyWorkoutGoal_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnTrue', async () => {
    //December 27th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 27, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;
    const daysWithWorkoutsThisWeek = 6;

    mockWorkoutRepo.getWorkoutsByDate = jest.fn().mockResolvedValue([]);

    const result = await createWorkoutService[
      'hasWorkoutGoalBeenReachedOrExceeded'
    ](
      weeklyWorkoutGoalAchievedAt,
      workoutCreatedAt,
      weeklyWorkoutGoal,
      userId,
      daysWithWorkoutsThisWeek,
    );

    expect(result).toBe(true);
  });
});
