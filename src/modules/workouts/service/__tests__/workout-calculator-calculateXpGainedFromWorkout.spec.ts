import { Test } from '@nestjs/testing';
import { UserStats } from 'src/modules/user/models/user-stats.model';
import { InsertWorkoutModel, WorkoutModel } from '../../models';
import { WorkoutRepository } from '../../repository/workout.repository';
import { WorkoutCalculator } from '../workout.calculator';

describe('WorkoutCalculator: calculateGainedXp', () => {
  let workoutCalculator: WorkoutCalculator;
  let mockWorkoutRepo: typeof mockWorkoutRepoMethods;
  const mockDate = new Date('2024-10-16T15:45:00.000Z');

  const mockWorkoutRepoMethods = {
    findWorkoutsThisWeekWithDistinctDates: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkoutCalculator,
        {
          provide: WorkoutRepository,
          useValue: mockWorkoutRepoMethods,
        },
      ],
    }).compile();
    workoutCalculator = module.get(WorkoutCalculator);
    mockWorkoutRepo = module.get(WorkoutRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('xpGainedFromWeeklyGoal should be 0 if weeklyBonusAwardedAt is in the current week', async () => {
    const mockDate = new Date('2024-10-16T15:45:00.000Z');
    const workout = new InsertWorkoutModel();
    workout.createdAt = mockDate;
    const userStats = new UserStats();
    userStats.weeklyBonusAwardedAt = new Date('2024-10-15T15:45:00.000Z');
    userStats.weeklyWorkoutGoal = 4;

    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    mockWorkoutRepo.findWorkoutsThisWeekWithDistinctDates.mockResolvedValue([
      new WorkoutModel(),
      new WorkoutModel(),
    ]);

    const { xpGainedFromWeeklyGoal } =
      await workoutCalculator.calculateXpGainedFromWorkout(
        workout,
        userStats,
        'user-id',
      );

    expect(xpGainedFromWeeklyGoal).toBe(0);
  });
  it('xpGainedFromWeeklyGoal should be 0 if numWorkoutsThisWeek is less than weeklyGoal', async () => {
    const workout = new InsertWorkoutModel();
    workout.createdAt = mockDate;
    const userStats = new UserStats();
    userStats.weeklyBonusAwardedAt = new Date('2024-10-08T15:45:00.000Z'); //set to a value in previous week
    userStats.weeklyWorkoutGoal = 4;

    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    mockWorkoutRepo.findWorkoutsThisWeekWithDistinctDates.mockResolvedValue([
      new WorkoutModel(),
      new WorkoutModel(),
    ]);

    const { xpGainedFromWeeklyGoal } =
      await workoutCalculator.calculateXpGainedFromWorkout(
        workout,
        userStats,
        'user-id',
      );

    expect(xpGainedFromWeeklyGoal).toBe(0);
  });
  it('xpGainedFromWeeklyGoal should be populated if weeklyBonusAwardedAt is not the current week and weekly goal is hit', async () => {
    const mockDate = new Date('2024-10-16T15:45:00.000Z');
    const workout = new InsertWorkoutModel();
    workout.createdAt = mockDate;
    const userStats = new UserStats();
    userStats.weeklyBonusAwardedAt = new Date('2024-10-08T15:45:00.000Z'); // set to value in previous week
    userStats.weeklyWorkoutGoal = 4;

    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    mockWorkoutRepo.findWorkoutsThisWeekWithDistinctDates.mockResolvedValue([
      new WorkoutModel(),
      new WorkoutModel(),
      new WorkoutModel(),
    ]);

    const { xpGainedFromWeeklyGoal } =
      await workoutCalculator.calculateXpGainedFromWorkout(
        workout,
        userStats,
        'user-id',
      );

    expect(xpGainedFromWeeklyGoal).toBe(70);
  });
});
