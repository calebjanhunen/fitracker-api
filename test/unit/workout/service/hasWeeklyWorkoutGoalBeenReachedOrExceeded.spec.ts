import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from 'src/common/logger/logger.service';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { UserService } from 'src/modules/user/service/user.service';
import {
  WorkoutEffortXpCalculator,
  WorkoutGoalXpCalculator,
} from 'src/modules/workouts/calculator';
import { WorkoutModel } from 'src/modules/workouts/models';
import { WorkoutRepository } from 'src/modules/workouts/repository/workout.repository';
import { WorkoutService } from 'src/modules/workouts/service/workout.service';
import { MockLoggerService } from 'test/mocks/mock-logger.service';

describe('WorkoutService - hasWorkoutGoalBeenReachedOrExceeded', () => {
  let workoutService: WorkoutService;
  let mockExerciseService: Partial<ExerciseService>;
  let mockWorkoutRepo: Partial<WorkoutRepository>;
  let mockUserService: Partial<UserService>;
  let mockWorkoutEffortXpCalculator: Partial<WorkoutEffortXpCalculator>;
  let mockWorkoutGoalXpCalculator: Partial<WorkoutGoalXpCalculator>;
  const userId = 'user-id';

  beforeEach(async () => {
    mockExerciseService = {};
    mockWorkoutRepo = {};
    mockUserService = {};
    mockWorkoutEffortXpCalculator = {};
    mockWorkoutGoalXpCalculator = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutService,
        { provide: ExerciseService, useValue: mockExerciseService },
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
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
          provide: LoggerService,
          useValue: new MockLoggerService(),
        },
      ],
    }).compile();

    workoutService = module.get<WorkoutService>(WorkoutService);
  });

  it('GivenWorkoutGoalAchievedAtThatIsThisWeek_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnFalse', async () => {
    //December 29th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 29, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;

    const result = await workoutService['hasWorkoutGoalBeenReachedOrExceeded'](
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

    const result = await workoutService['hasWorkoutGoalBeenReachedOrExceeded'](
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

    const result = await workoutService['hasWorkoutGoalBeenReachedOrExceeded'](
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

    const result = await workoutService['hasWorkoutGoalBeenReachedOrExceeded'](
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

    const result = await workoutService['hasWorkoutGoalBeenReachedOrExceeded'](
      weeklyWorkoutGoalAchievedAt,
      workoutCreatedAt,
      weeklyWorkoutGoal,
      userId,
      daysWithWorkoutsThisWeek,
    );

    expect(result).toBe(true);
  });
});
