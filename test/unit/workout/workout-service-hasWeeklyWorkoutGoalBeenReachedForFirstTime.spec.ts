import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { UserService } from 'src/modules/user/service/user.service';
import { WorkoutModel } from 'src/modules/workouts/models';
import { WorkoutRepository } from 'src/modules/workouts/repository/workout.repository';
import { WorkoutEffortXpHelper } from 'src/modules/workouts/service/workout-effort-xp.helper';
import { WorkoutService } from 'src/modules/workouts/service/workout.service';

describe('Workout Service: hasWeeklyWorkoutGoalBeenReachedForFirstTime', () => {
  let workoutService: WorkoutService;
  let mockExerciseService: Partial<ExerciseService>;
  let mockWorkoutRepo: Partial<WorkoutRepository>;
  let mockUserService: Partial<UserService>;
  let mockWorkoutEffortXpHelper: Partial<WorkoutEffortXpHelper>;
  const userId = 'user-id';

  beforeEach(async () => {
    mockExerciseService = {};
    mockWorkoutRepo = {};
    mockUserService = {};
    mockWorkoutEffortXpHelper = {};
    mockWorkoutEffortXpHelper = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutService,
        { provide: ExerciseService, useValue: mockExerciseService },
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
        { provide: UserService, useValue: mockUserService },
        { provide: WorkoutEffortXpHelper, useValue: mockWorkoutEffortXpHelper },
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

    const result = await workoutService[
      'hasWeeklyWorkoutGoalBeenReachedForFirstTime'
    ](weeklyWorkoutGoalAchievedAt, workoutCreatedAt, weeklyWorkoutGoal, userId);
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

    const result = await workoutService[
      'hasWeeklyWorkoutGoalBeenReachedForFirstTime'
    ](weeklyWorkoutGoalAchievedAt, workoutCreatedAt, weeklyWorkoutGoal, userId);

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
    mockWorkoutRepo.getNumberOfDaysWhereAWorkoutWasCompletedThisWeek = jest
      .fn()
      .mockResolvedValue(daysWithWorkoutsThisWeek);

    const result = await workoutService[
      'hasWeeklyWorkoutGoalBeenReachedForFirstTime'
    ](weeklyWorkoutGoalAchievedAt, workoutCreatedAt, weeklyWorkoutGoal, userId);

    expect(result).toBe(false);
  });

  it('GivenNumberOfDaysWithWorkoutsThisWeekEqualToWeeklyWorkoutGoal_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnTrue', async () => {
    //December 27th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 27, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;
    const daysWithWorkoutsThisWeek = 3;

    mockWorkoutRepo.getWorkoutsByDate = jest.fn().mockResolvedValue([]);
    mockWorkoutRepo.getNumberOfDaysWhereAWorkoutWasCompletedThisWeek = jest
      .fn()
      .mockResolvedValue(daysWithWorkoutsThisWeek);

    const result = await workoutService[
      'hasWeeklyWorkoutGoalBeenReachedForFirstTime'
    ](weeklyWorkoutGoalAchievedAt, workoutCreatedAt, weeklyWorkoutGoal, userId);

    expect(result).toBe(true);
  });
  it('GivenNumberOfDaysWithWorkoutsThisWeekGreaterThanWeeklyWorkoutGoal_WhenCheckingIfWeeklyGoalBeenReachedForFirstTime_ReturnFalse', async () => {
    //December 27th, 2024 14:00
    const weeklyWorkoutGoalAchievedAt = new Date(2024, 11, 27, 14, 0, 0);
    //December 30th, 2024 12:00
    const workoutCreatedAt = new Date(2024, 11, 30, 12, 0, 0);
    const weeklyWorkoutGoal = 4;
    const daysWithWorkoutsThisWeek = 5;

    mockWorkoutRepo.getWorkoutsByDate = jest.fn().mockResolvedValue([]);
    mockWorkoutRepo.getNumberOfDaysWhereAWorkoutWasCompletedThisWeek = jest
      .fn()
      .mockResolvedValue(daysWithWorkoutsThisWeek);

    const result = await workoutService[
      'hasWeeklyWorkoutGoalBeenReachedForFirstTime'
    ](weeklyWorkoutGoalAchievedAt, workoutCreatedAt, weeklyWorkoutGoal, userId);

    expect(result).toBe(false);
  });
});
