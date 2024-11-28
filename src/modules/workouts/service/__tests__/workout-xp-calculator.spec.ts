import { Test } from '@nestjs/testing';
import { InsertWorkoutModel } from '../../models';
import { WorkoutXpCalculator } from '../workout-xp-calculator';

describe('WorkoutXpCalculator', () => {
  let workoutXpCalulator: WorkoutXpCalculator;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WorkoutXpCalculator],
    }).compile();

    workoutXpCalulator = module.get(WorkoutXpCalculator);
  });

  describe('Test calculateXpGainedFromWorkoutDuration', () => {
    it('should return 0 if workout is less than 15 minutes', () => {
      const workout = new InsertWorkoutModel();
      workout.createdAt = new Date('2024-11-28T11:30');
      workout.lastUpdatedAt = new Date('2024-11-28:T11:44');

      const xpGained =
        workoutXpCalulator['calculateXpGainedFromWorkoutDuration'](workout);

      expect(xpGained).toBe(0);
    });

    it('should return 1 xp per minute of workout if workout is longer than 15 minutes', () => {
      const workout = new InsertWorkoutModel();
      workout.createdAt = new Date('2024-11-28T11:30');
      workout.lastUpdatedAt = new Date('2024-11-28T12:22');

      const xpGained =
        workoutXpCalulator['calculateXpGainedFromWorkoutDuration'](workout);

      expect(xpGained).toBe(52);
    });
  });
});
